import { Schema, model, Document, Types } from "mongoose";

export enum ApplicationStatus {
    PENDING_PROFESSOR = "Pending_Professor",
    PENDING_HOD = "Pending_HOD",
    PENDING_ACCOUNTS = "Pending_Accounts",
    APPROVED = "Approved",
    REJECTED = "Rejected",
}

export interface IDocument {
    filename: string;
    mimetype: string;
    url: string;
}

export interface IApplication extends Document {
    student_id: Types.ObjectId;
    professor_id: Types.ObjectId;
    hod_id: Types.ObjectId;
    accounts_id: Types.ObjectId;
    current_reviewer_id: Types.ObjectId;
    status: ApplicationStatus;
    title: string;
    description: string;
    amount_requested: number;
    documents: IDocument[];
    rejection_reason?: string | undefined;
    createdAt: Date;
    updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
    {
        filename: { type: String, required: true },
        mimetype: { type: String, required: true },
        url: { type: String, required: true },
    },
    { _id: false }
);

const applicationSchema = new Schema<IApplication>(
    {
        student_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
        professor_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
        hod_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
        accounts_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
        current_reviewer_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
        status: {
            type: String,
            enum: Object.values(ApplicationStatus),
            default: ApplicationStatus.PENDING_PROFESSOR,
        },
        title: { type: String, required: true },
        description: { type: String, required: true },
        amount_requested: { type: Number, required: true, min: 0 },
        documents: { type: [documentSchema], default: [] },
        rejection_reason: { type: String },
    },
    { timestamps: true }
);

applicationSchema.index({ student_id: 1 });
applicationSchema.index({ current_reviewer_id: 1, status: 1 });

export const Application = model<IApplication>("Application", applicationSchema);
