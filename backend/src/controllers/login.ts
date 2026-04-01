import type { Request, Response } from "express";
import { User } from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function login(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (user.status === "Blocked") {
        return res.status(403).json({ message: "Account is blocked" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
        return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
        { id: String(user._id), roles: user.roles },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES as any }
    );

    // Remove sensitive data before sending user object
    const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        status: user.status,
        labs_assigned: user.labs_assigned
    };

    res.json({ token, user: userResponse });
}