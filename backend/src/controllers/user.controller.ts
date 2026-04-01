import type { Response, NextFunction, Request } from "express";
import { Types } from "mongoose";
import { User } from "../models/User.js";
import { Lab } from "../models/Lab.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { UserRole } from "../types/roles.js";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "../services/email.service.js";

export async function getMe(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const user = await User.findById(userId).select("_id name email roles status labs_assigned");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user });
}

export async function listUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const roles: string[] = req.user?.roles || [];
        const actorId = req.user?.id;

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const q = (req.query.q as string | undefined)?.trim();
        const role = req.query.role as UserRole | undefined;
        const lab_id = req.query.lab_id as string | undefined;

        const query: any = {};

        if (role) query.roles = role;
        if (lab_id) query.labs_assigned = lab_id;
        if (q) {
            query.$or = [
                { name: { $regex: q, $options: "i" } },
                { email: { $regex: q, $options: "i" } },
            ];
        }

        // Lab in-charge scoping: only allow seeing assistants within their lab(s)
        if (roles.includes(UserRole.LAB_INCHARGE) && !roles.includes(UserRole.ADMIN)) {
            const labs = await Lab.find({ incharge_id: actorId }, { _id: 1 });
            const labIds = labs.map((l) => String(l._id));

            query.roles = UserRole.ASSISTANT;
            
            if (lab_id) {
                if (!labIds.includes(String(lab_id))) {
                    return res.status(403).json({ message: "Forbidden: Invalid lab scope" });
                }
                query.labs_assigned = lab_id;
            } else {
                // Return assistants assigned to ANY of the incharge's labs
                // OR unassigned ones
                query.$or = [
                    { labs_assigned: { $in: labIds } },
                    { labs_assigned: { $exists: false } },
                    { labs_assigned: { $size: 0 } },
                    { labs_assigned: null },
                ];
            }
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .select("_id name email roles status labs_assigned")
                .sort({ name: 1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(query),
        ]);

        return res.status(200).json({
            users,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        return next(err);
    }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const { name, roles, status, labs_assigned } = req.body as any;

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const oldLabs = user.labs_assigned || [];

        if (typeof name === "string") user.name = name;
        if (Array.isArray(roles)) user.roles = roles;
        if (status) user.status = status;
        
        if (labs_assigned !== undefined) {
            const newLabs = Array.isArray(labs_assigned) ? labs_assigned : (labs_assigned ? [labs_assigned] : []);
            
            // Sync Labs: If Incharge, ensure lab->incharge_id is set
            if (user.roles.includes(UserRole.LAB_INCHARGE)) {
                // Labs removed
                const removed = oldLabs.filter(l => !newLabs.includes(String(l)));
                for (const lId of removed) {
                    await Lab.updateOne({ _id: lId, incharge_id: user._id }, { $unset: { incharge_id: "" } });
                }
                // Labs added
                const added = newLabs.filter(l => !oldLabs.map(String).includes(String(l)));
                for (const lId of added) {
                    await Lab.updateOne({ _id: lId }, { $set: { incharge_id: user._id } });
                }
            }
            
            // Sync Assistants
            if (user.roles.includes(UserRole.ASSISTANT)) {
                 const removed = oldLabs.filter(l => !newLabs.includes(String(l)));
                 if (removed.length > 0) {
                     await Lab.updateMany({ _id: { $in: removed } }, { $pull: { assistant_ids: user._id } });
                 }
                 const added = newLabs.filter(l => !oldLabs.map(String).includes(String(l)));
                 if (added.length > 0) {
                     await Lab.updateMany({ _id: { $in: added } }, { $addToSet: { assistant_ids: user._id } });
                 }
            }

            user.labs_assigned = newLabs.map(l => new Types.ObjectId(String(l)));
        }

        await user.save();

        return res.status(200).json({
            message: "User updated",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                roles: user.roles,
                status: user.status,
                labs_assigned: user.labs_assigned,
            },
        });
    } catch (err) {
        return next(err);
    }
}

export const createUser= async(req:Request, res:Response)=>{
    try{
        const {name, email, password, roles, labs_assigned}=req.body;
        const userExists=await User.findOne({email});
        if(userExists) return res.status(400).json({message:"User already exists"});

        if (!email.endsWith("@iitd.ac.in")) {
            return res.status(400).json({ message: "Only IITD emails allowed" });
        }

        const hashedPass=await bcrypt.hash(password, 10);
        const labs = Array.isArray(labs_assigned) ? labs_assigned : (labs_assigned ? [labs_assigned] : []);

        const user=await User.create({
            name, 
            email, 
            password_hash:hashedPass, 
            roles, 
            labs_assigned: labs
        });

        if (roles && roles.includes(UserRole.LAB_INCHARGE) && labs.length > 0) {
             await Lab.updateMany({ _id: { $in: labs } }, { $set: { incharge_id: user._id } });
        }
        if (roles && roles.includes(UserRole.ASSISTANT) && labs.length > 0) {
            await Lab.updateMany({ _id: { $in: labs } }, { $addToSet: { assistant_ids: user._id } });
        }

        // Send welcome email (Async, non-blocking)
        sendWelcomeEmail(email, {
            name,
            password, // Plain text password from request body
            roles: Array.isArray(roles) ? roles : [roles]
        }).catch(err => console.error("Post-creation email failed:", err));

        return res.status(201).json({message:"User created", user});
    }catch(err){
        return res.status(500).json({message:"Failed to create user", err});
    }
}