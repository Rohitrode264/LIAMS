import { BookingStatus } from "../types/bookingStatus.js";

const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
    [BookingStatus.PENDING]: [BookingStatus.APPROVED, BookingStatus.REJECTED, BookingStatus.CANCELLED],
    [BookingStatus.APPROVED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
    [BookingStatus.REJECTED]: [],
    [BookingStatus.CANCELLED]: [],
    [BookingStatus.COMPLETED]: [],
};

export function isValidTransition(
    currentStatus: BookingStatus,
    newStatus: BookingStatus
): boolean {
    if (currentStatus === newStatus) return true;
    const allowedNextStates = ALLOWED_TRANSITIONS[currentStatus];
    return allowedNextStates.includes(newStatus);
}
