import { z } from "zod";
import mongoose from "mongoose";

const objectId = z.string().refine((val) => mongoose.isValidObjectId(val), {
    message: "Invalid ObjectId",
});

export const createHierarchySchema = z.object({
    professor_id: objectId,
    hod_id: objectId,
    accounts_id: objectId,
});

export const updateHierarchySchema = z.object({
    professor_id: objectId.optional(),
    hod_id: objectId.optional(),
    accounts_id: objectId.optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
});

export type CreateHierarchyDto = z.infer<typeof createHierarchySchema>;
export type UpdateHierarchyDto = z.infer<typeof updateHierarchySchema>;
