import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { PasswordReset } from "../models/PasswordReset.js";

export async function resetPassword(req: Request, res: Response) {
    try {
        const { email, otp, newPassword } = req.body;

        const resetRecord = await PasswordReset.findOne({ email });
        if (!resetRecord) {
            return res.status(400).json({ message: "OTP expired or invalid" });
        }

        // Verify OTP
        const isMatch = await bcrypt.compare(otp, resetRecord.otp_hash);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Update Password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.updateOne({ email }, { password_hash: hashedPassword });

        // Cleanup
        await PasswordReset.deleteOne({ email });

        res.status(200).json({ message: "Password reset successful. Please sign in with your new password." });

    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Reset failed", error });
    }
}
