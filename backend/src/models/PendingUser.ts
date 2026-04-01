import { Schema, model, Document } from "mongoose";
import { UserRole } from "../types/roles.js";

export interface IPendingUser extends Document {
    name: string;
    email: string;
    password_hash: string;
    roles: UserRole[];
    otp_hash: string;
    createdAt: Date;
}

const pendingUserSchema = new Schema<IPendingUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password_hash: { type: String, required: true },
        roles: {
            type: [String],
            enum: Object.values(UserRole),
            default: [UserRole.STUDENT],
        },
        otp_hash: { type: String, required: true },
        createdAt: { type: Date, default: Date.now, expires: 300 } // Document expires 300 seconds (5 mins) after creation
    }
);

export const PendingUser = model<IPendingUser>("PendingUser", pendingUserSchema);
