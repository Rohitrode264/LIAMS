import { Router } from "express";
import { signup } from "../controllers/signUp.js";
import { verifyOTP } from "../controllers/verifyOtp.js";
import { login } from "../controllers/login.js";
import { validate } from "../middleware/validate.middleware.js";
import { loginSchema, signupSchema, verifyOtpSchema } from "../validations/auth.validation.js";

const router = Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/verify-otp", validate(verifyOtpSchema), verifyOTP);
router.post("/login", validate(loginSchema), login);

export const authRoutes = router;
