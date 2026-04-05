import mongoose from "mongoose";
import type { Request, Response, NextFunction } from "express";
import { Booking } from "../models/Booking.js";
import { Component } from "../models/Component.js";
import { BookingLog } from "../models/BookingLog.js";
import { Lab } from "../models/Lab.js";
import { User } from "../models/User.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { BookingStatus } from "../types/bookingStatus.js";
import { isValidTransition } from "../services/bookingState.service.js";
import { UserRole } from "../types/roles.js";
import { sendBookingNotification } from "../services/email.service.js";


// @desc    Create a new booking (Student)
// @route   POST /api/bookings
// @access  Student
export async function createBooking(req: AuthRequest, res: Response, next: NextFunction) {
    // Start a MongoDB session for transaction safety
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { component_id, lab_id, start, end, purpose } = req.body;
        const student_id = req.user?.id;

        // 1. Verify component exists and belongs to the lab
        const component = await Component.findOne({ _id: component_id, lab_id }).session(session);
        if (!component || component.status !== "Available") {
            await session.abortTransaction();
            return res.status(400).json({ message: "Component unavailable or invalid" });
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        // 2. Double Booking Prevention Logic
        const overlappingBookings = await Booking.find({
            component_id,
            status: { $in: [BookingStatus.PENDING, BookingStatus.APPROVED] },
            $and: [
                { start: { $lt: endDate } },
                { end: { $gt: startDate } }
            ]
        }).session(session);

        if (overlappingBookings.length > 0) {
            await session.abortTransaction();
            return res.status(409).json({ message: "Equipment is already booked for this time slot" });
        }

        let assignedUnit = 1;

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const booking = await Booking.create(
            [
                {
                    component_id,
                    lab_id,
                    student_id,
                    start: startDate,
                    end: endDate,
                    status: BookingStatus.PENDING,
                    unit_number: assignedUnit,
                    purpose,
                    expires_at: expiresAt,
                },
            ],
            { session }
        );


        if (!booking || booking.length === 0) {
            throw new Error("Failed to create booking document");
        }
        // 4. Log the creation action atomically
        await BookingLog.create(
            [
                {
                    booking_id: booking[0]!._id,
                    action_by: student_id,
                    action: "BOOKING_CREATED",
                    new_status: BookingStatus.PENDING,
                },
            ],
            { session }
        );

        await session.commitTransaction();

        // 5. Send notifications to Lab In-charge and Assistants (Async but not awaited for response)
        try {
            const lab = await Lab.findById(lab_id).populate("incharge_id assistant_ids");
            const student = await User.findById(student_id);

            if (lab && student) {
                const emails: string[] = [];
                if (lab.incharge_id && (lab.incharge_id as any).email) {
                    emails.push((lab.incharge_id as any).email);
                }
                lab.assistant_ids.forEach((asst: any) => {
                    if (asst.email) emails.push(asst.email);
                });

                emails.forEach(email => {
                    sendBookingNotification(email, {
                        studentName: student.name,
                        componentName: component.name,
                        labName: lab.name,
                        startTime: startDate.toLocaleString(),
                        endTime: endDate.toLocaleString(),
                        unitNumber: assignedUnit
                    });
                });
            }
        } catch (emailError) {
            console.error("Failed to send booking notifications:", emailError);
        }

        res.status(201).json({ message: "Booking requested successfully", booking: booking[0] });

    } catch (error) {
        await session.abortTransaction();
        return next(error);
    } finally {
        session.endSession();
    }
}

// @desc    Approve or Reject a booking
// @route   PATCH /api/bookings/:id/status
// @access  Lab In-Charge
export async function updateBookingStatus(req: AuthRequest, res: Response, next: NextFunction) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;
        const { status, assigned_to, rejection_reason } = req.body;
        const approver_id = req.user?.id;
        const roles: string[] = req.user?.roles || [];

        const booking = await Booking.findById(id).session(session);
        if (!booking) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Booking not found" });
        }

        // Lab scoping: Lab In-Charge can only manage bookings for their lab(s)
        if (roles.includes(UserRole.LAB_INCHARGE) && !roles.includes(UserRole.ADMIN)) {
            const isIncharge = await Lab.exists({ _id: booking.lab_id, incharge_id: approver_id });
            if (!isIncharge) {
                await session.abortTransaction();
                return res.status(403).json({ message: "Forbidden: You are not the in-charge for this lab" });
            }
        }

        // State Machine Enforcement
        if (!isValidTransition(booking.status, status)) {
            await session.abortTransaction();
            return res.status(400).json({ message: `Cannot transition status from ${booking.status} to ${status}` });
        }

        const previous_status = booking.status;
        booking.status = status;
        booking.approved_by = approver_id;

        if (status === BookingStatus.APPROVED) {
            // 1) Ensure assistant is valid and assigned to same lab (if provided)
            const assistant = await User.findById(assigned_to).session(session);
            if (!assistant) {
                await session.abortTransaction();
                return res.status(400).json({ message: "Invalid assigned_to user" });
            }
            if (!assistant.roles?.includes(UserRole.ASSISTANT)) {
                await session.abortTransaction();
                return res.status(400).json({ message: "assigned_to user is not an Assistant" });
            }
            if (assistant.labs_assigned && assistant.labs_assigned.length > 0 && !assistant.labs_assigned.map(String).includes(String(booking.lab_id))) {
                await session.abortTransaction();
                return res.status(400).json({ message: "Assistant is not assigned to this lab" });
            }

            // 2) Re-check capacity before approving (prevents race conditions)
            const component = await Component.findById(booking.component_id).session(session);
            if (!component || component.status !== "Available") {
                await session.abortTransaction();
                return res.status(409).json({ message: "Component unavailable" });
            }

            const overlappingApproved = await Booking.countDocuments({
                component_id: booking.component_id,
                status: BookingStatus.APPROVED,
                _id: { $ne: booking._id },
                $and: [{ start: { $lt: booking.end } }, { end: { $gt: booking.start } }],
            }).session(session);

            if (overlappingApproved > 0) {
                await session.abortTransaction();
                return res.status(409).json({ message: "Equipment is already booked for this time slot" });
            }

            booking.assigned_to = assigned_to;
        }

        if (status === BookingStatus.REJECTED && rejection_reason) {
            booking.rejection_reason = rejection_reason;
        }

        await booking.save({ session });

        // Audit Log
        await BookingLog.create(
            [
                {
                    booking_id: booking._id,
                    action_by: approver_id,
                    action:
                        status === BookingStatus.APPROVED
                            ? "BOOKING_APPROVED"
                            : status === BookingStatus.REJECTED
                                ? "BOOKING_REJECTED"
                                : "BOOKING_CANCELLED",
                    previous_status,
                    new_status: status,
                },
            ],
            { session }
        );

        await session.commitTransaction();
        res.status(200).json({ message: `Booking ${status.toLowerCase()}`, booking });
    } catch (error) {
        await session.abortTransaction();
        return next(error);
    } finally {
        session.endSession();
    }
}

// @desc    Mark booking as completed
// @route   PATCH /api/bookings/:id/complete
// @access  Assistant
export async function completeBooking(req: AuthRequest, res: Response, next: NextFunction) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;
        const actor_id = req.user?.id;
        const roles: string[] = req.user?.roles || [];

        const bookingQuery = roles.includes(UserRole.ADMIN)
            ? { _id: id }
            : { _id: id, assigned_to: actor_id };

        const booking = await Booking.findOne(bookingQuery).session(session);

        if (!booking) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Booking not found or not assigned to you" });
        }

        // State Machine Enforcement
        if (!isValidTransition(booking.status, BookingStatus.COMPLETED)) {
            await session.abortTransaction();
            return res.status(400).json({ message: `Cannot mark as completed from status: ${booking.status}` });
        }

        const previous_status = booking.status;
        booking.status = BookingStatus.COMPLETED;
        await booking.save({ session });

        // Audit Log
        await BookingLog.create(
            [
                {
                    booking_id: booking._id,
                    action_by: actor_id,
                    action: "BOOKING_COMPLETED",
                    previous_status,
                    new_status: BookingStatus.COMPLETED,
                },
            ],
            { session }
        );

        await session.commitTransaction();
        res.status(200).json({ message: "Booking marked as completed", booking });
    } catch (error) {
        await session.abortTransaction();
        return next(error);
    } finally {
        session.endSession();
    }
}

// @desc    Cancel a booking (Student cancels own; Admin cancels any)
// @route   PATCH /api/bookings/:id/cancel
// @access  Student, Admin
export async function cancelBooking(req: AuthRequest, res: Response, next: NextFunction) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;
        const actor_id = req.user?.id;
        const roles: string[] = req.user?.roles || [];

        const booking = await Booking.findById(id).session(session);
        if (!booking) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Booking not found" });
        }

        if (roles.includes(UserRole.STUDENT) && !roles.includes(UserRole.ADMIN)) {
            if (String(booking.student_id) !== String(actor_id)) {
                await session.abortTransaction();
                return res.status(403).json({ message: "Forbidden: You can only cancel your own bookings" });
            }
        }

        if (!isValidTransition(booking.status, BookingStatus.CANCELLED)) {
            await session.abortTransaction();
            return res.status(400).json({ message: `Cannot cancel booking from status: ${booking.status}` });
        }

        const previous_status = booking.status;
        booking.status = BookingStatus.CANCELLED;
        await booking.save({ session });

        await BookingLog.create(
            [
                {
                    booking_id: booking._id,
                    action_by: actor_id,
                    action: "BOOKING_CANCELLED",
                    previous_status,
                    new_status: BookingStatus.CANCELLED,
                },
            ],
            { session }
        );

        await session.commitTransaction();
        res.status(200).json({ message: "Booking cancelled", booking });
    } catch (error) {
        await session.abortTransaction();
        return next(error);
    } finally {
        session.endSession();
    }
}

// @desc    Get bookings based on user role
// @route   GET /api/bookings
// @access  Authenticated
export async function getBookings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const userRole = req.user?.roles;
        const userId = req.user?.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        let query = {};

        if (userRole?.includes(UserRole.STUDENT)) {
            query = { student_id: userId };
        } else if (userRole?.includes(UserRole.ASSISTANT)) {
            const user = await User.findById(userId);
            if (user?.labs_assigned && user.labs_assigned.length > 0) {
                query = { lab_id: { $in: user.labs_assigned } };
            } else {
                query = { assigned_to: userId };
            }
        } else if (userRole?.includes(UserRole.LAB_INCHARGE) && !userRole?.includes(UserRole.ADMIN)) {
            const labs = await Lab.find({ incharge_id: userId }, { _id: 1 });
            const labIds = labs.map((l) => l._id);
            query = { lab_id: { $in: labIds } };
        }

        if (req.query.lab_id) {
            // Enforce lab filter safety for Lab In-Charge
            if (userRole?.includes(UserRole.LAB_INCHARGE) && !userRole?.includes(UserRole.ADMIN)) {
                const allowed = await Lab.exists({ _id: req.query.lab_id, incharge_id: userId });
                if (!allowed) {
                    return res.status(403).json({ message: "Forbidden: Invalid lab scope" });
                }
            }
            query = { ...query, lab_id: req.query.lab_id };
        }

        if (req.query.status && req.query.status !== 'ALL') {
            query = { ...query, status: req.query.status };
        }

        const bookings = await Booking.find(query)
            .populate("student_id", "name email")
            .populate("component_id", "name")
            .populate("lab_id", "name location")
            .populate("assigned_to", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Booking.countDocuments(query);

        res.status(200).json({
            bookings,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return next(error);
    }
}

// @desc    Get availability for a specific component and date
// @route   GET /api/v1/bookings/availability/:id?date=YYYY-MM-DD
// @access  Authenticated
export async function getComponentAvailability(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ success: false, message: "Date query parameter is required" });
        }

        const component = await Component.findById(id);
        if (!component) {
            return res.status(404).json({ success: false, message: "Component not found" });
        }

        const searchDate = new Date(date as string);
        const startOfDay = new Date(new Date(searchDate).setHours(0, 0, 0, 0));
        const endOfDay = new Date(new Date(searchDate).setHours(23, 59, 59, 999));

        const dayBookings = await Booking.find({
            component_id: id,
            status: { $in: [BookingStatus.PENDING, BookingStatus.APPROVED] },
            $or: [
                { start: { $gte: startOfDay, $lte: endOfDay } },
                { end: { $gte: startOfDay, $lte: endOfDay } },
                { start: { $lte: startOfDay }, end: { $gte: endOfDay } }
            ]
        }).sort({ start: 1 });

        // Logic to group by overlapping intervals
        const bookedSlots = dayBookings.map((b: any) => {
            const overlaps = dayBookings.filter(other =>
                (other.start < b.end && other.end > b.start)
            ).length;

            return {
                start: b.start,
                end: b.end,
                bookedCount: overlaps,
                remaining: Math.max(0, 1 - overlaps)
            };
        });

        res.status(200).json({
            componentId: id,
            date: date,
            bookedSlots: bookedSlots.filter((slot, index, self) =>
                index === self.findIndex((s) => (
                    s.start.getTime() === slot.start.getTime() && s.end.getTime() === slot.end.getTime()
                ))
            )
        });
    } catch (error) {
        return next(error);
    }
}

