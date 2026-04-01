import { z } from "zod";
import { BookingStatus } from "../types/bookingStatus.js";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createBookingSchema = z.object({
    body: z
        .object({
            component_id: z.string().regex(objectIdRegex, "Invalid component ID format"),
            lab_id: z.string().regex(objectIdRegex, "Invalid lab ID format"),
            start: z.string().datetime({ message: "Start must be a valid ISO 8601 date string" }),
            end: z.string().datetime({ message: "End must be a valid ISO 8601 date string" }),
            purpose: z.string().optional(),
        })
        .refine((data) => new Date(data.start) < new Date(data.end), {
            message: "Start time must be before end time",
            path: ["start"],
        })
        .refine((data) => new Date(data.start) > new Date(), {
            message: "Start time cannot be in the past",
            path: ["start"],
        }),
});

export const updateBookingStatusSchema = z.object({
    params: z.object({
        id: z.string().regex(objectIdRegex, "Invalid booking ID format"),
    }),
    body: z.object({
        status: z.enum([BookingStatus.APPROVED, BookingStatus.REJECTED, BookingStatus.CANCELLED]),
        assigned_to: z.string().regex(objectIdRegex, "Invalid assistant ID").optional(),
        rejection_reason: z.string().optional(),
    }).refine((data) => {
        if (data.status === BookingStatus.APPROVED && !data.assigned_to) {
            return false;
        }
        return true;
    }, {
        message: "assigned_to is required when approving a booking",
        path: ["assigned_to"]
    }).refine((data) => {
        if (data.status === BookingStatus.REJECTED && !data.rejection_reason) {
            return false;
        }
        return true;
    }, {
        message: "rejection_reason is required when rejecting a booking",
        path: ["rejection_reason"]
    }),
});

export const cancelBookingSchema = z.object({
    params: z.object({
        id: z.string().regex(objectIdRegex, "Invalid booking ID format"),
    }),
});
