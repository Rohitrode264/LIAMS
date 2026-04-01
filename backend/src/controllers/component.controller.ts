import type { Request, Response } from "express";
import { Component } from "../models/Component.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { Lab } from "../models/Lab.js";
import { UserRole } from "../types/roles.js";

// @desc    Add a new component to a lab
// @route   POST /api/components
// @access  Admin, LabIncharge
export async function addComponent(req: AuthRequest, res: Response) {
    try {
        const { lab_id, name, description } = req.body;

        const newComponent = await Component.create({
            lab_id,
            name,
            description,
        });

        res.status(201).json({ message: "Component added successfully", component: newComponent });
    } catch (error) {
        res.status(500).json({ message: "Failed to add component", error });
    }
}

// @desc    Get all components for a specific lab
// @route   GET /api/components/:labId
// @access  Authenticated
export async function getComponentsByLab(req: Request, res: Response) {
    try {
        const { labId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const query = { lab_id: labId, status: { $ne: "Inactive" } };
        const components = await Component.find(query)
            .skip(skip)
            .limit(limit);

        const total = await Component.countDocuments(query);

        res.status(200).json({
            components,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch components", error });
    }
}

// @desc    Get a component by ID
// @route   GET /api/components/by-id/:id
// @access  Authenticated
export async function getComponentById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const component = await Component.findById(id);
        if (!component) return res.status(404).json({ message: "Component not found" });
        return res.status(200).json({ component });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch component", error });
    }
}

// @desc    Update a component
// @route   PATCH /api/components/:id
// @access  Admin, LabIncharge (restricted to their lab)
export async function updateComponent(req: AuthRequest, res: Response) {
    try {
        const { id } = req.params;
        const roles: string[] = req.user?.roles || [];
        const actorId = req.user?.id;

        const component = await Component.findById(id);
        if (!component) return res.status(404).json({ message: "Component not found" });

        if (roles.includes(UserRole.LAB_INCHARGE) && !roles.includes(UserRole.ADMIN)) {
            const isIncharge = await Lab.exists({ _id: component.lab_id, incharge_id: actorId });
            if (!isIncharge) return res.status(403).json({ message: "Forbidden: Invalid lab scope" });
        }

        const { name, description, status } = req.body;

        if (typeof name === "string") component.name = name;
        if (typeof description === "string") component.description = description;
        if (status) component.status = status;

        await component.save();
        return res.status(200).json({ message: "Component updated", component });
    } catch (error) {
        return res.status(500).json({ message: "Failed to update component", error });
    }
}
