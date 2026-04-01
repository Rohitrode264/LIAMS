import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import * as hierarchyService from "../services/hierarchy.service.js";
import { createHierarchySchema, updateHierarchySchema } from "../validations/hierarchy.validation.js";

export async function createHierarchy(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const dto = createHierarchySchema.parse(req.body);
        const hierarchy = await hierarchyService.createHierarchy(dto, req.user.id);
        res.status(201).json({ success: true, data: hierarchy });
    } catch (error) {
        next(error);
    }
}

export async function getAllHierarchies(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const hierarchies = await hierarchyService.getAllHierarchies();
        res.json({ success: true, data: hierarchies });
    } catch (error) {
        next(error);
    }
}

export async function updateHierarchy(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const dto = updateHierarchySchema.parse(req.body);
        const hierarchy = await hierarchyService.updateHierarchy(req.params.id as string, dto);
        res.json({ success: true, data: hierarchy });
    } catch (error) {
        next(error);
    }
}

export async function deleteHierarchy(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        await hierarchyService.deleteHierarchy(req.params.id as string);
        res.json({ success: true, message: "Hierarchy deleted successfully" });
    } catch (error) {
        next(error);
    }
}
