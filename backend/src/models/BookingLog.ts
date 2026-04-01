import { Schema, model, Document, Types } from "mongoose";
import { BookingStatus } from "../types/bookingStatus.js";

export interface IBookingLog extends Document {
    booking_id: Types.ObjectId;
    action_by?: Types.ObjectId;
    action: string;
    previous_status?: BookingStatus;
    new_status: BookingStatus;
    timestamp: Date;
}

const bookingLogSchema = new Schema<IBookingLog>(
    {
        booking_id: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
        action_by: { type: Schema.Types.ObjectId, ref: "User" },
        action: { type: String, required: true },
        previous_status: { type: String, enum: Object.values(BookingStatus) },
        new_status: { type: String, enum: Object.values(BookingStatus), required: true },
        timestamp: { type: Date, default: Date.now },
    },
    {
        collection: "booking_logs",
    }
);

export const BookingLog = model<IBookingLog>("BookingLog", bookingLogSchema);