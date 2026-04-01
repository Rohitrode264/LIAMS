import cron from "node-cron";
import mongoose from "mongoose";
import { Booking } from "../models/Booking.js";
import { BookingLog } from "../models/BookingLog.js";
import { BookingStatus } from "../types/bookingStatus.js";

// Run every hour at minute 0
export const initCronJobs = () => {
    cron.schedule("0 * * * *", async () => {
        console.log("[Cron] Running routine check for expired pending bookings...");

        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            // Find bookings that have exceeded their soft expiration
            const expiredBookings = await Booking.find({
                status: BookingStatus.PENDING,
                expires_at: { $lt: new Date() }
            }).session(session);

            if (expiredBookings.length === 0) {
                await session.abortTransaction();
                return;
            }

            console.log(`[Cron] Found ${expiredBookings.length} expired bookings to cancel.`);

            const expBookingIds = expiredBookings.map(b => b._id);

            // Update statuses to Cancelled
            await Booking.updateMany(
                { _id: { $in: expBookingIds } },
                { $set: { status: BookingStatus.CANCELLED } },
                { session }
            );

            // Generate audit logs for the automated cancellations
            const logsToInsert = expiredBookings.map(b => ({
                booking_id: b._id,
                action_by: null,
                action: "BOOKING_CANCELLED",
                previous_status: BookingStatus.PENDING,
                new_status: BookingStatus.CANCELLED,
            }));

            // Use a dummy zero ObjectId to represent "System Action"
            const SYSTEM_ID = new mongoose.Types.ObjectId('000000000000000000000000');
            logsToInsert.forEach(log => (log.action_by as any) = SYSTEM_ID);

            await BookingLog.insertMany(logsToInsert, { session });

            await session.commitTransaction();
            console.log(`[Cron] Successfully cancelled ${expiredBookings.length} bookings.`);
        } catch (error) {
            console.error("[Cron] Error processing expired bookings:", error);
            await session.abortTransaction();
        } finally {
            session.endSession();
        }
    });
};
