import { Schema, model, Document, Types } from "mongoose";
import { BookingStatus } from "../types/bookingStatus.js";

export interface IBooking extends Document {
    component_id: Types.ObjectId;
    lab_id: Types.ObjectId;
    student_id: Types.ObjectId;
    start: Date;
    end: Date;
    status: BookingStatus;
    unit_number?: number;
    approved_by?: Types.ObjectId;
    assigned_to?: Types.ObjectId;
    rejection_reason?: string;
    purpose?: string;
    expires_at?: Date;
}

const bookingSchema = new Schema<IBooking>(
    {
        component_id: {
            type: Schema.Types.ObjectId,
            ref: "Component",
            required: true,
        },
        unit_number: { type: Number },
        lab_id: {
            type: Schema.Types.ObjectId,
            ref: "Lab",
            required: true,
        },
        student_id: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        start: { type: Date, required: true },
        end: { type: Date, required: true },
        status: {
            type: String,
            enum: Object.values(BookingStatus),
            default: BookingStatus.PENDING,
        },
        approved_by: { type: Schema.Types.ObjectId, ref: "User" },
        assigned_to: { type: Schema.Types.ObjectId, ref: "User" },
        rejection_reason: String,
        purpose: String,
        expires_at: Date,
    },
    { timestamps: true }
);

bookingSchema.index({ component_id: 1, start: 1, end: 1 });
bookingSchema.index({ student_id: 1 });
bookingSchema.index({ lab_id: 1 });
bookingSchema.index({ status: 1, expires_at: 1 });

export const Booking = model<IBooking>("Booking", bookingSchema);