import { z } from "zod";
import mongoose from "mongoose";

const objectId = z.string().refine((val) => mongoose.isValidObjectId(val), {
    message: "Invalid ObjectId",
});

export const createApplicationSchema = z.object({
    professor_id: objectId,
    title: z.string().min(3, "Title must be at least 3 characters").max(200),
    description: z.string().min(10, "Description must be at least 10 characters"),
    amount_requested: z.number().positive("Amount must be a positive number"),
    documents: z.array(
        z.object({
            filename: z.string(),
            mimetype: z.string(),
            url: z.string(),
        })
    ).optional().default([]),
});

export const reviewApplicationSchema = z.object({
    action: z.enum(["approve", "reject"]),
    remarks: z.string().optional(),
}).refine(
    (data) => !(data.action === "reject" && !data.remarks?.trim()),
    { message: "Remarks are required when rejecting an application", path: ["remarks"] }
);

export type CreateApplicationDto = z.infer<typeof createApplicationSchema>;
export type ReviewApplicationDto = z.infer<typeof reviewApplicationSchema>;
