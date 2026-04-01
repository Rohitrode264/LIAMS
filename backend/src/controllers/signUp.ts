import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { PendingUser } from "../models/PendingUser.js";
import { generateOTP } from "../utils/generateOtp.js";
import { sendOTP } from "../services/email.service.js";

export async function signup(req: Request, res: Response) {
    try {
        const { name, email, password } = req.body;

        if (!email.endsWith("@iitd.ac.in")) {
            return res.status(400).json({ message: "Only IITD emails allowed" });
        }

        const user = await User.findOne({ email });
        const pendingUser = await PendingUser.findOne({ email });

        if (user || pendingUser) {
            return res.status(400).json({ message: "User already exists or email is pending verification" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = generateOTP();
        const otpHash = await bcrypt.hash(otp, 10);

        const newPendingUser = await PendingUser.create({
            name,
            email,
            password_hash: hashedPassword,
            otp_hash: otpHash,
            // roles intentionally omitted – defaults to [Student]
        });

        await sendOTP(email, otp);

        res.status(201).json({
            message: "Registration started. Please verify OTP within 5 minutes.",
            pendingUserId: newPendingUser._id,
        });
    } catch (error) {
        // If email fails, cleanup the pending user so they can try again once they fix config
        if (req.body.email) {
            await PendingUser.deleteOne({ email: req.body.email });
        }
        res.status(500).json({ message: "Signup failed", error });
    }
}