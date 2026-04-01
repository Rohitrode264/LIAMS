import { Router } from "express";
import {
    createApplication,
    getMyApplications,
    getProfessorQueue,
    getHODQueue,
    getAccountsQueue,
    reviewApplication,
    getApplicationById,
    getAllApplications,
    getReviewHistory,
} from "../controllers/application.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/rbac.middleware.js";
import { UserRole } from "../types/roles.js";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin: view all applications
router.get(
    "/",
    authorizeRoles(UserRole.ADMIN),
    getAllApplications
);

// Student: submit an application
router.post(
    "/",
    authorizeRoles(UserRole.STUDENT),
    createApplication
);

// Student: view their own applications
router.get(
    "/my",
    authorizeRoles(UserRole.STUDENT),
    getMyApplications
);

// Professor: pending review queue
router.get(
    "/review/professor",
    authorizeRoles(UserRole.PROFESSOR),
    getProfessorQueue
);

// HOD: pending review queue
router.get(
    "/review/hod",
    authorizeRoles(UserRole.HOD),
    getHODQueue
);

// Accounts: pending review queue
router.get(
    "/review/accounts",
    authorizeRoles(UserRole.ACCOUNTANT),
    getAccountsQueue
);

// Reviewers: History of past decisions
router.get(
    "/review/history",
    authorizeRoles(UserRole.PROFESSOR, UserRole.HOD, UserRole.ACCOUNTANT),
    getReviewHistory
);

// Single application detail (any authenticated user — service handles ownership for students)
router.get(
    "/:id",
    getApplicationById
);

// Review action (Professor | HOD | Accountant)
router.patch(
    "/:id/review",
    authorizeRoles(UserRole.PROFESSOR, UserRole.HOD, UserRole.ACCOUNTANT),
    reviewApplication
);

export const applicationRoutes = router;
