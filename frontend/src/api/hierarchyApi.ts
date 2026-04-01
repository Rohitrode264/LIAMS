import { api } from "./axios";
import type { ApprovalHierarchy } from "../types";

export interface CreateHierarchyPayload {
    professor_id: string;
    hod_id: string;
    accounts_id: string;
}

export interface UpdateHierarchyPayload {
    professor_id?: string;
    hod_id?: string;
    accounts_id?: string;
}

export const getAllHierarchies = async (): Promise<ApprovalHierarchy[]> => {
    const { data } = await api.get<{ success: boolean; data: ApprovalHierarchy[] }>("/hierarchy");
    return data.data;
};

export const createHierarchy = async (payload: CreateHierarchyPayload) => {
    const { data } = await api.post<{ success: boolean; data: ApprovalHierarchy }>("/hierarchy", payload);
    return data.data;
};

export const updateHierarchy = async (id: string, payload: UpdateHierarchyPayload) => {
    const { data } = await api.patch<{ success: boolean; data: ApprovalHierarchy }>(`/hierarchy/${id}`, payload);
    return data.data;
};

export const deleteHierarchy = async (id: string) => {
    const { data } = await api.delete<{ success: boolean; message: string }>(`/hierarchy/${id}`);
    return data;
};
