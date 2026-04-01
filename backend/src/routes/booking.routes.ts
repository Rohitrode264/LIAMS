import { Router } from "express";
import {
    createBooking,
    updateBookingStatus,
    completeBooking,
    cancelBooking,
    getBookings,
    getComponentAvailability,
} from "../controllers/booking.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/rbac.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { cancelBookingSchema, createBookingSchema, updateBookingStatusSchema } from "../validations/booking.validation.js";
import { UserRole } from "../types/roles.js";

const router = Router();

// Fully authenticated route layer
router.use(authenticate);

// @route   GET /api/bookings
// @desc    Get bookings (Filtered by user role inside controller)
// @access  Authenticated
router.get("/", getBookings);

// @route   POST /api/bookings
// @desc    Create a new booking request
// @access  Students only
router.post(
    "/",
    authorizeRoles(UserRole.STUDENT),
    validate(createBookingSchema),
    createBooking
);

// @route   PATCH /api/bookings/:id/status
// @desc    Approve/Reject booking and assign assistant
// @access  Lab In-Charge only
router.patch(
    "/:id/status",
    authorizeRoles(UserRole.LAB_INCHARGE, UserRole.ADMIN),
    validate(updateBookingStatusSchema),
    updateBookingStatus
);

// @route   PATCH /api/bookings/:id/complete
// @desc    Mark booking equipment usage complete
// @access  Assistant only
router.patch(
    "/:id/complete",
    authorizeRoles(UserRole.ASSISTANT, UserRole.ADMIN),
    completeBooking
);

// @route   PATCH /api/bookings/:id/cancel
// @desc    Cancel a booking (student cancels own; admin can cancel any)
// @access  Student, Admin
router.patch(
    "/:id/cancel",
    authorizeRoles(UserRole.STUDENT, UserRole.ADMIN),
    validate(cancelBookingSchema),
    cancelBooking
);

export const bookingRoutes = router;
