import { Schema, model, Document, Types } from "mongoose";

export interface IApprovalHierarchy extends Document {
    professor_id: Types.ObjectId;
    hod_id: Types.ObjectId;
    accounts_id: Types.ObjectId;
    created_by: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const approvalHierarchySchema = new Schema<IApprovalHierarchy>(
    {
        professor_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
        hod_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
        accounts_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
        created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

// Ensure one professor maps to one hierarchy
approvalHierarchySchema.index({ professor_id: 1 }, { unique: true });

export const ApprovalHierarchy = model<IApprovalHierarchy>("ApprovalHierarchy", approvalHierarchySchema);
