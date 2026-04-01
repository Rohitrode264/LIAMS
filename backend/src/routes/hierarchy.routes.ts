import { Router } from "express";
import {
    createHierarchy,
    getAllHierarchies,
    updateHierarchy,
    deleteHierarchy,
} from "../controllers/hierarchy.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/rbac.middleware.js";
import { UserRole } from "../types/roles.js";

const router = Router();

router.use(authenticate);
router.use(authorizeRoles(UserRole.ADMIN));

router.post("/", createHierarchy);
router.get("/", getAllHierarchies);
router.patch("/:id", updateHierarchy);
router.delete("/:id", deleteHierarchy);

export const hierarchyRoutes = router;
