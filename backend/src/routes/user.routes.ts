import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/rbac.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { UserRole } from "../types/roles.js";
import { createUser, getMe, listUsers, updateUser } from "../controllers/user.controller.js";
import { createUserSchema, listUsersSchema, updateUserSchema } from "../validations/user.validation.js";

const router = Router();

router.use(authenticate);

router.get("/me", getMe);

router.post("/",authorizeRoles(UserRole.ADMIN), validate(createUserSchema), createUser);

router.get("/", authorizeRoles(
    UserRole.ADMIN,
    UserRole.LAB_INCHARGE,
    UserRole.STUDENT,
    UserRole.PROFESSOR,
    UserRole.HOD,
    UserRole.ACCOUNTANT
), validate(listUsersSchema), listUsers);


router.patch("/:id", authorizeRoles(UserRole.ADMIN), validate(updateUserSchema), updateUser);

export const userRoutes = router;

