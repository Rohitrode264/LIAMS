import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createComponentSchema = z.object({
    body: z.object({
        lab_id: z.string().regex(objectIdRegex, "Invalid Lab ID format"),
        name: z.string().min(2, "Component name is required"),
        description: z.string().optional(),
        status: z.enum(["Available", "Maintenance", "Inactive"]).default("Available"),
    }),
});

export const updateComponentSchema = z.object({
    params: z.object({
        id: z.string().regex(objectIdRegex, "Invalid Component ID format"),
    }),
    body: z
        .object({
            name: z.string().min(2).optional(),
            description: z.string().optional(),
            status: z.enum(["Available", "Maintenance", "Inactive"]).optional(),
        })
        .refine((b) => Object.keys(b).length > 0, { message: "At least one field is required" }),
});
