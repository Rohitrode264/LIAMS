import { Schema, model, Document, Types } from "mongoose";

export enum ActionType {
    SUBMITTED = "Submitted",
    APPROVED = "Approved",
    REJECTED = "Rejected",
    FORWARDED = "Forwarded",
}

export interface IApplicationLog extends Document {
    application_id: Types.ObjectId;
    action_by: Types.ObjectId;
    action_type: ActionType;
    remarks?: string;
    timestamp: Date;
}

const applicationLogSchema = new Schema<IApplicationLog>(
    {
        application_id: { type: Schema.Types.ObjectId, ref: "Application", required: true },
        action_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
        action_type: {
            type: String,
            enum: Object.values(ActionType),
            required: true,
        },
        remarks: { type: String },
        timestamp: { type: Date, default: () => new Date() },
    },
    { timestamps: false }
);

applicationLogSchema.index({ application_id: 1, timestamp: 1 });

export const ApplicationLog = model<IApplicationLog>("ApplicationLog", applicationLogSchema);
