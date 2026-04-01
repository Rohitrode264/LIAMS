import { Schema, model, Document, Types } from "mongoose";
import { UserRole } from "../types/roles.js";

export interface IUser extends Document {
    name: string;
    email: string;
    password_hash: string;
    roles: UserRole[];
    labs_assigned: Types.ObjectId[];
    status: "Active" | "Blocked";
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password_hash: { type: String, required: true },
        roles: {
            type: [String],
            enum: Object.values(UserRole),
            default: [UserRole.STUDENT],
        },
        labs_assigned: [{ type: Schema.Types.ObjectId, ref: "Lab" }],
        status: { type: String, default: "Active" },
    },
    { timestamps: true }
);

export const User = model<IUser>("User", userSchema);