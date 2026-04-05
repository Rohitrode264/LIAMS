import { api } from "./axios";
import type { Application } from "../types";

// ─── Student ─────────────────────────────────────────────────────────────────

export interface CreateApplicationPayload {
    professor_id: string;
    title: string;
    description: string;
    amount_requested: number;
    documents?: { filename: string; mimetype: string; url: string }[];
}

export const createApplication = async (payload: CreateApplicationPayload) => {
    const { data } = await api.post<{ success: boolean; data: Application }>("/applications", payload);
    return data.data;
};

export const getMyApplications = async (page = 1, limit = 10): Promise<{ applications: Application[], pagination: any }> => {
    const { data } = await api.get<{ success: boolean; applications: Application[], pagination: any }>(`/applications/my?page=${page}&limit=${limit}`);
    return { applications: data.applications, pagination: data.pagination };
};

// ─── Review Queues ───────────────────────────────────────────────────────────

export const getProfessorQueue = async (): Promise<Application[]> => {
    const { data } = await api.get<{ success: boolean; data: Application[] }>("/applications/review/professor");
    return data.data;
};

export const getHODQueue = async (): Promise<Application[]> => {
    const { data } = await api.get<{ success: boolean; data: Application[] }>("/applications/review/hod");
    return data.data;
};

export const getAccountsQueue = async (): Promise<Application[]> => {
    const { data } = await api.get<{ success: boolean; data: Application[] }>("/applications/review/accounts");
    return data.data;
};

export const getReviewHistory = async (page = 1, limit = 10): Promise<{ applications: Application[], pagination: any }> => {
    const { data } = await api.get<{ success: boolean; applications: Application[], pagination: any }>(`/applications/review/history?page=${page}&limit=${limit}`);
    return { applications: data.applications, pagination: data.pagination };
};

// ─── Review Action ───────────────────────────────────────────────────────────

export interface ReviewPayload {
    action: "approve" | "reject";
    remarks?: string;
}

export const reviewApplication = async (id: string, payload: ReviewPayload) => {
    const { data } = await api.patch<{ success: boolean; data: Application }>(`/applications/${id}/review`, payload);
    return data.data;
};

// ─── Shared ──────────────────────────────────────────────────────────────────

export const getApplicationById = async (id: string) => {
    const { data } = await api.get<{ success: boolean; data: { application: Application; logs: any[] } }>(`/applications/${id}`);
    return data.data;
};

// ─── Admin ───────────────────────────────────────────────────────────────────

export const getAllApplications = async (): Promise<Application[]> => {
    const { data } = await api.get<{ success: boolean; data: Application[] }>("/applications");
    return data.data;
};

// ─── Users for Select Dropdowns ──────────────────────────────────────────────

export const getUsersByRole = async (role: string) => {
    const { data } = await api.get<{ success: boolean; users: any[] }>(`/users?role=${role}`);
    return data.users ?? [];
};
