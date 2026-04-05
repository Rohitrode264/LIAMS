import { Schema, model, Document } from "mongoose";

export interface IPasswordReset extends Document {
    email: string;
    otp_hash: string;
    createdAt: Date;
}

const passwordResetSchema = new Schema<IPasswordReset>(
    {
        email: { type: String, required: true, unique: true },
        otp_hash: { type: String, required: true },
        createdAt: { type: Date, default: Date.now, expires: 300 } // Expires in 5 minutes
    }
);

export const PasswordReset = model<IPasswordReset>("PasswordReset", passwordResetSchema);
