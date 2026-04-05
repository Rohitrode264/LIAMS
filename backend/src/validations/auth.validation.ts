import { z } from "zod";
import { UserRole } from "../types/roles.js";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const signupSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name is required"),
        email: z.string().email("Invalid email"),
        password: z.string().min(8, "Password must be at least 8 characters"),
    }),
});

export const verifyOtpSchema = z.object({
    body: z.object({
        pendingUserId: z.string().regex(objectIdRegex, "Invalid pendingUserId format"),
        otp: z.string().regex(/^[0-9]{6}$/, "OTP must be a 6 digit code"),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email"),
        password: z.string().min(1, "Password is required"),
    }),
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email"),
    }),
});

export const resetPasswordSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email"),
        otp: z.string().regex(/^[0-9]{6}$/, "OTP must be a 6 digit code"),
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
    }),
});

