import { Router } from "express";
import { addComponent, getComponentById, getComponentsByLab, updateComponent } from "../controllers/component.controller.js";
import { getComponentAvailability } from "../controllers/booking.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/rbac.middleware.js";
import { UserRole } from "../types/roles.js";

import { validate } from "../middleware/validate.middleware.js";
import { createComponentSchema, updateComponentSchema } from "../validations/component.validation.js";

const router = Router();

router.use(authenticate);

// Publicly visible to authenticated users to view what's in a lab
router.get("/by-id/:id", getComponentById);
router.get("/:labId", getComponentsByLab);
router.get("/:id/availability", getComponentAvailability);

// Only Admins and Lab In-Charges can add components to a lab
router.post("/", authorizeRoles(UserRole.ADMIN, UserRole.LAB_INCHARGE), validate(createComponentSchema), addComponent);
router.patch("/:id", authorizeRoles(UserRole.ADMIN, UserRole.LAB_INCHARGE), validate(updateComponentSchema), updateComponent);

export const componentRoutes = router;
