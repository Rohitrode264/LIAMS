import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createLabSchema = z.object({
    body: z.object({
        name: z.string().min(3, "Lab name must be at least 3 characters long"),
        description: z.string().optional(),
        location: z.string().min(2, "Location is required"),
        incharge_id: z.preprocess(
            (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
            z.string().regex(objectIdRegex, "Invalid Incharge ID format").optional()
        ),
        assistant_ids: z
            .preprocess(
                (v) => (Array.isArray(v) && v.length === 0 ? undefined : v),
                z.array(z.string().regex(objectIdRegex, "Invalid Assistant ID format")).optional()
            ),
    }),
});

export const updateLabSchema = z.object({
    params: z.object({
        id: z.string().regex(objectIdRegex, "Invalid Lab ID format"),
    }),
    body: z
        .object({
            name: z.string().min(3).optional(),
            description: z.string().optional(),
            location: z.string().min(2).optional(),
            status: z.enum(["Active", "Inactive"]).optional(),
            incharge_id: z.preprocess(
                (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
                z.string().regex(objectIdRegex, "Invalid Incharge ID format").optional()
            ),
            assistant_ids: z
                .preprocess(
                    (v) => (Array.isArray(v) && v.length === 0 ? undefined : v),
                    z.array(z.string().regex(objectIdRegex, "Invalid Assistant ID format")).optional()
                ),
        })
        .refine((b) => Object.keys(b).length > 0, { message: "At least one field is required" }),
});