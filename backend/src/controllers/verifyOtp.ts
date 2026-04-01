import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { User } from "../models/User.js";
import { PendingUser } from "../models/PendingUser.js";
import bcrypt from "bcryptjs";

export async function verifyOTP(req: Request, res: Response) {
    const { pendingUserId, otp } = req.body;

    const pendingUser = await PendingUser.findById(pendingUserId);
    if (!pendingUser) {
        return res.status(400).json({ message: "Invalid or expired request" });
    }

    const isValid = await bcrypt.compare(otp, pendingUser.otp_hash);
    if (!isValid) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    // Create the confirmed user
    const user = await User.create({
        name: pendingUser.name,
        email: pendingUser.email,
        password_hash: pendingUser.password_hash,
        roles: pendingUser.roles,
    });

    // Delete the pending user record
    await PendingUser.findByIdAndDelete(pendingUserId);

    const token = jwt.sign(
        { id: String(user._id), roles: user.roles },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES as any }
    );

    // Remove sensitive data
    const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        status: user.status
    };

    res.json({ message: "Verified successfully", token, user: userResponse });
}