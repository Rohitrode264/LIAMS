import { Schema, model, Document, Types } from "mongoose";

export interface IComponent extends Document {
  lab_id: Types.ObjectId;
  name: string;
  description: string;
  status: "Available" | "Maintenance" | "Inactive";
}

const componentSchema = new Schema<IComponent>(
  {
    lab_id: { type: Schema.Types.ObjectId, ref: "Lab", required: true },
    name: { type: String, required: true },
    description: String,
    status: { type: String, default: "Available" },
  },
  { timestamps: true }
);

componentSchema.index({ lab_id: 1 });

export const Component = model<IComponent>("Component", componentSchema);