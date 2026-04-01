import { Schema, model, Document, Types } from "mongoose";

export interface ILab extends Document {
  name: string;
  description: string;
  location: string;
  incharge_id?: Types.ObjectId;
  assistant_ids: Types.ObjectId[];
  status: "Active" | "Inactive";
}

const labSchema = new Schema<ILab>(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    location: String,
    incharge_id: { type: Schema.Types.ObjectId, ref: "User" },
    assistant_ids: [{ type: Schema.Types.ObjectId, ref: "User" }],
    status: { type: String, default: "Active" },
  },
  { timestamps: true }
);

export const Lab = model<ILab>("Lab", labSchema);   