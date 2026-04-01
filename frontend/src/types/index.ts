export enum UserRole {
    STUDENT = "Student",
    ADMIN = "Admin",
    ASSISTANT = "Assistant",
    LAB_INCHARGE = "LabIncharge",
    PROFESSOR = "Professor",
    HOD = "HOD",
    ACCOUNTANT = "Accountant",
}

export interface User {
    _id: string;
    name: string;
    email: string;
    roles: UserRole[];
    status: "Active" | "Blocked";
    labs_assigned?: string[];
}

export interface AuthResponse {
    message?: string;
    token?: string;
    pendingUserId?: string;
}

export interface Lab {
    _id: string;
    name: string;
    description?: string;
    location?: string;
    status: "Active" | "Inactive";
    incharge_id?: User;
    assistant_ids?: User[];
}

export interface Component {
    _id: string;
    lab_id: string;
    name: string;
    description?: string;
    status: "Available" | "Maintenance" | "Inactive";
}

export enum BookingStatus {
    PENDING = "Pending",
    APPROVED = "Approved",
    REJECTED = "Rejected",
    COMPLETED = "Completed",
    CANCELLED = "Cancelled",
}

export interface Booking {
    _id: string;
    component_id: Component;
    lab_id: string | Lab;
    student_id: User;
    start: string; // ISO Date String
    end: string;   // ISO Date String
    status: BookingStatus;
    unit_number?: number;
    purpose?: string;
    assigned_to?: User;
    rejection_reason?: string;
}

export interface PaginatedResponse<T> {
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
    [key: string]: any | T[];
}

export type PaginatedLabs = PaginatedResponse<Lab> & { labs: Lab[] };
export type PaginatedComponents = PaginatedResponse<Component> & { components: Component[] };
export type PaginatedBookings = PaginatedResponse<Booking> & { bookings: Booking[] };

export interface AvailabilitySlot {
    start: string;
    end: string;
    bookedCount: number;
    remaining: number;
}

export interface AvailabilityResponse {
    componentId: string;
    date: string;
    bookedSlots: AvailabilitySlot[];
}

// ─── Application Management ─────────────────────────────────────────────────

export enum ApplicationStatus {
    PENDING_PROFESSOR = "Pending_Professor",
    PENDING_HOD = "Pending_HOD",
    PENDING_ACCOUNTS = "Pending_Accounts",
    APPROVED = "Approved",
    REJECTED = "Rejected",
}

export interface AppDocument {
    filename: string;
    mimetype: string;
    url: string;
}

export interface Application {
    _id: string;
    student_id: User;
    professor_id: User;
    hod_id: User;
    accounts_id: User;
    current_reviewer_id: User;
    status: ApplicationStatus;
    title: string;
    description: string;
    amount_requested: number;
    documents: AppDocument[];
    rejection_reason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ApplicationLog {
    _id: string;
    application_id: string;
    action_by: User;
    action_type: "Submitted" | "Approved" | "Rejected" | "Forwarded";
    remarks?: string;
    timestamp: string;
}

export interface ApprovalHierarchy {
    _id: string;
    professor_id: User;
    hod_id: User;
    accounts_id: User;
    created_by: string;
    createdAt: string;
}

