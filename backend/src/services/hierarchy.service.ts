import mongoose from "mongoose";
import { ApprovalHierarchy } from "../models/ApprovalHierarchy.js";
import type { CreateHierarchyDto, UpdateHierarchyDto } from "../validations/hierarchy.validation.js";

export async function createHierarchy(dto: CreateHierarchyDto, adminId: string) {
    const existing = await ApprovalHierarchy.findOne({ professor_id: dto.professor_id });
    if (existing) {
        throw Object.assign(new Error("A hierarchy for this professor already exists"), { statusCode: 409 });
    }
    const hierarchy = await ApprovalHierarchy.create({
        professor_id: new mongoose.Types.ObjectId(dto.professor_id),
        hod_id: new mongoose.Types.ObjectId(dto.hod_id),
        accounts_id: new mongoose.Types.ObjectId(dto.accounts_id),
        created_by: new mongoose.Types.ObjectId(adminId),
    });
    return ApprovalHierarchy.findById(hierarchy._id)
        .populate("professor_id", "name email")
        .populate("hod_id", "name email")
        .populate("accounts_id", "name email");
}

export async function getAllHierarchies() {
    return ApprovalHierarchy.find()
        .populate("professor_id", "name email roles")
        .populate("hod_id", "name email roles")
        .populate("accounts_id", "name email roles")
        .sort({ createdAt: -1 });
}

export async function updateHierarchy(id: string, dto: UpdateHierarchyDto) {
    const hierarchy = await ApprovalHierarchy.findById(id);
    if (!hierarchy) {
        throw Object.assign(new Error("Hierarchy not found"), { statusCode: 404 });
    }
    const updateData: Record<string, mongoose.Types.ObjectId> = {};
    if (dto.professor_id) updateData.professor_id = new mongoose.Types.ObjectId(dto.professor_id);
    if (dto.hod_id) updateData.hod_id = new mongoose.Types.ObjectId(dto.hod_id);
    if (dto.accounts_id) updateData.accounts_id = new mongoose.Types.ObjectId(dto.accounts_id);

    return ApprovalHierarchy.findByIdAndUpdate(id, updateData, { new: true })
        .populate("professor_id", "name email")
        .populate("hod_id", "name email")
        .populate("accounts_id", "name email");
}

export async function deleteHierarchy(id: string) {
    const hierarchy = await ApprovalHierarchy.findById(id);
    if (!hierarchy) {
        throw Object.assign(new Error("Hierarchy not found"), { statusCode: 404 });
    }
    await ApprovalHierarchy.findByIdAndDelete(id);
}

export async function findHierarchyByProfessor(professorId: string) {
    return ApprovalHierarchy.findOne({ professor_id: professorId });
}
