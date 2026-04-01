import type { Request, Response } from "express";
import { Lab } from "../models/Lab.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { User } from "../models/User.js";
import { UserRole } from "../types/roles.js";

// @desc    Create a new lab
// @route   POST /api/labs
// @access  Admin only
export async function createLab(req: AuthRequest, res: Response) {
    try {
        const { name, description, location, incharge_id, assistant_ids } = req.body;

        const existingLab = await Lab.findOne({ name });
        if (existingLab) {
            return res.status(400).json({ message: "Lab with this name already exists" });
        }

        if (incharge_id) {
            const incharge = await User.findById(incharge_id);
            if (!incharge) return res.status(400).json({ message: "Invalid incharge_id" });
            if (!incharge.roles?.includes(UserRole.LAB_INCHARGE)) {
                return res.status(400).json({ message: "Selected incharge user does not have Lab In-Charge role" });
            }
        }

        if (assistant_ids?.length) {
            const assistants = await User.find({ _id: { $in: assistant_ids } });
            if (assistants.length !== assistant_ids.length) {
                return res.status(400).json({ message: "One or more assistant_ids are invalid" });
            }
            const invalid = assistants.find((u) => !u.roles?.includes(UserRole.ASSISTANT));
            if (invalid) {
                return res.status(400).json({ message: "One or more assistant users do not have Assistant role" });
            }
        }

        const lab = await Lab.create({
            name,
            description,
            location,
            incharge_id,
            assistant_ids,
        });

        // Keep user->lab assignment in sync
        if (incharge_id) {
            await User.updateOne({ _id: incharge_id }, { $addToSet: { labs_assigned: lab._id } });
        }
        if (assistant_ids?.length) {
            await User.updateMany({ _id: { $in: assistant_ids } }, { $addToSet: { labs_assigned: lab._id } });
        }

        res.status(201).json({ message: "Lab created successfully", lab });
    } catch (error) {
        res.status(500).json({ message: "Failed to create lab", error });
    }
}

// @desc    Get all active labs
// @route   GET /api/labs
// @access  Authenticated
export async function getLabs(req: Request, res: Response) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const labs = await Lab.find({ status: "Active" })
            .populate("incharge_id", "name email")
            .populate("assistant_ids", "name email")
            .skip(skip)
            .limit(limit);

        const total = await Lab.countDocuments({ status: "Active" });

        res.status(200).json({
            labs,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch labs", error });
    }
}

// @desc    Get a single lab by ID
// @route   GET /api/labs/:id
// @access  Authenticated
export async function getLabById(req: Request, res: Response) {
    try {
        const lab = await Lab.findById(req.params.id)
            .populate("incharge_id", "name email")
            .populate("assistant_ids", "name email");

        if (!lab) {
            return res.status(404).json({ message: "Lab not found" });
        }

        res.status(200).json(lab);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch lab", error });
    }
}

// @desc    Update lab details (including status/staff)
// @route   PATCH /api/labs/:id
// @access  Admin only
export async function updateLab(req: AuthRequest, res: Response) {
    try {
        const { id } = req.params;
        const { name, description, location, status, incharge_id, assistant_ids } = req.body;

        const lab = await Lab.findById(id);
        if (!lab) return res.status(404).json({ message: "Lab not found" });

        if (name && name !== lab.name) {
            const exists = await Lab.findOne({ name });
            if (exists) return res.status(400).json({ message: "Lab with this name already exists" });
            lab.name = name;
        }

        if (typeof description === "string") lab.description = description;
        if (typeof location === "string") lab.location = location;
        if (status) lab.status = status;

        if (incharge_id !== undefined) {
            const oldInchargeId = lab.incharge_id;
            if (incharge_id) {
                const incharge = await User.findById(incharge_id);
                if (!incharge) return res.status(400).json({ message: "Invalid incharge_id" });
                if (!incharge.roles?.includes(UserRole.LAB_INCHARGE)) {
                    return res.status(400).json({ message: "Selected incharge user does not have Lab In-Charge role" });
                }
                
                if (String(oldInchargeId) !== String(incharge_id)) {
                    if (oldInchargeId) {
                        await User.updateOne({ _id: oldInchargeId }, { $pull: { labs_assigned: lab._id } });
                    }
                    lab.incharge_id = incharge_id;
                    await User.updateOne({ _id: incharge_id }, { $addToSet: { labs_assigned: lab._id } });
                }
            } else {
                if (oldInchargeId) {
                    await User.updateOne({ _id: oldInchargeId }, { $pull: { labs_assigned: lab._id } });
                }
                lab.incharge_id = undefined as any;
            }
        }

        if (assistant_ids !== undefined) {
            const oldAssistants = lab.assistant_ids || [];
            if (assistant_ids?.length) {
                const assistants = await User.find({ _id: { $in: assistant_ids } });
                if (assistants.length !== assistant_ids.length) {
                    return res.status(400).json({ message: "One or more assistant_ids are invalid" });
                }
                const invalid = assistants.find((u) => !u.roles?.includes(UserRole.ASSISTANT));
                if (invalid) {
                    return res.status(400).json({ message: "One or more assistant users do not have Assistant role" });
                }

                // Remove lab from old assistants not in the new list
                const toRemove = oldAssistants.filter(id => !assistant_ids.includes(String(id)));
                if (toRemove.length > 0) {
                    await User.updateMany({ _id: { $in: toRemove } }, { $pull: { labs_assigned: lab._id } });
                }

                // Add lab to new assistants
                lab.assistant_ids = assistant_ids;
                await User.updateMany({ _id: { $in: assistant_ids } }, { $addToSet: { labs_assigned: lab._id } });
            } else {
                if (oldAssistants.length > 0) {
                    await User.updateMany({ _id: { $in: oldAssistants } }, { $pull: { labs_assigned: lab._id } });
                }
                lab.assistant_ids = [];
            }
        }

        await lab.save();
        const populated = await Lab.findById(lab._id)
            .populate("incharge_id", "name email")
            .populate("assistant_ids", "name email");

        res.status(200).json({ message: "Lab updated successfully", lab: populated });
    } catch (error) {
        res.status(500).json({ message: "Failed to update lab", error });
    }
}
