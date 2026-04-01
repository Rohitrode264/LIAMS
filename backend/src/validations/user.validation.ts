import { z } from "zod";
import { UserRole } from "../types/roles.js";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createUserSchema = z.object({
    body: z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
        roles: z.array(z.nativeEnum(UserRole)).min(1),
        labs_assigned: z.array(z.string().regex(objectIdRegex, "Invalid lab ID format")).optional(),
    }),
}); 

export const listUsersSchema = z.object({
    query: z.object({
        role: z.nativeEnum(UserRole).optional(),
        lab_id: z.string().regex(objectIdRegex, "Invalid lab_id format").optional(),
        q: z.string().min(1).optional(),
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(200).optional(),
    }),
});

export const updateUserSchema = z.object({
    params: z.object({
        id: z.string().regex(objectIdRegex, "Invalid user ID format"),
    }),
    body: z
        .object({
            name: z.string().min(1).optional(),
            roles: z.array(z.nativeEnum(UserRole)).min(1).optional(),
            status: z.enum(["Active", "Blocked"]).optional(),
            labs_assigned: z.array(z.string().regex(objectIdRegex, "Invalid lab ID format")).optional(),
        })
        .refine((b) => Object.keys(b).length > 0, { message: "At least one field is required" }),
});

