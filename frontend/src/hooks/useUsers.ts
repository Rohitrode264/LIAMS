import { useQuery } from "@tanstack/react-query";
import { api } from "../api/axios";
import type { User } from "../types";

export const useUsersList = (params: { role?: string; lab_id?: string; q?: string } = {}) => {
  const query = new URLSearchParams();
  if (params.role) query.set("role", params.role);
  if (params.lab_id) query.set("lab_id", params.lab_id);
  if (params.q) query.set("q", params.q);

  return useQuery({
    queryKey: ["users", params],
    queryFn: async () => {
      const res = await api.get<{ users: User[] }>(`/users?${query.toString()}`);
      return res.data.users || [];
    },
  });
};

export const useAssistantsByLab = (labId: string | null) => {
  return useQuery({
    queryKey: ["assistants", labId],
    queryFn: async () => {
      const res = await api.get<{ users: User[] }>(
        `/users?role=Assistant&lab_id=${labId}`
      );
      return res.data.users || [];
    },
    enabled: !!labId,
  });
};

