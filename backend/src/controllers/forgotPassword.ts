import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { PasswordReset } from "../models/PasswordReset.js";
import { generateOTP } from "../utils/generateOtp.js";
import { sendOTP } from "../services/email.service.js";

export async function forgotPassword(req: Request, res: Response) {
    try {
        const { email } = req.body;

        if (!email.endsWith("@iitd.ac.in")) {
            return res.status(400).json({ message: "Only IITD emails allowed" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "No user found with this email" });
        }

        // Generate and Hash OTP
        const otp = generateOTP();
        const otpHash = await bcrypt.hash(otp, 10);

        // Remove existing reset records for this email
        await PasswordReset.deleteOne({ email });

        // Save new reset record
        await PasswordReset.create({
            email,
            otp_hash: otpHash
        });

        // Send OTP
        await sendOTP(email, otp);

        res.status(200).json({
            message: "Password reset OTP sent. Please verify within 5 minutes.",
            email: email
        });

    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: "Request failed", error });
    }
}
