import { Router } from "express";
import { createLab, getLabs, getLabById, updateLab } from "../controllers/lab.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/rbac.middleware.js";
import { UserRole } from "../types/roles.js";

import { validate } from "../middleware/validate.middleware.js";
import { createLabSchema, updateLabSchema } from "../validations/lab.validation.js";

const router = Router();

// Protect all lab routes with authentication
router.use(authenticate);

// Publicly visible to all authenticated users (Students, etc. need to see labs to book them)
router.get("/", getLabs);
router.get("/:id", getLabById);

// Restricted to Admins
router.post("/", authorizeRoles(UserRole.ADMIN), validate(createLabSchema), createLab);
router.patch("/:id", authorizeRoles(UserRole.ADMIN), validate(updateLabSchema), updateLab);

export const labRoutes = router;
