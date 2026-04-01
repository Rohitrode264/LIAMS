import { api } from '../api/axios';
import { useQuery } from '@tanstack/react-query';
import type { PaginatedLabs, PaginatedComponents, AvailabilityResponse } from '../types';

export const useLabs = (page = 1, limit = 10) => {
    return useQuery({
        queryKey: ['labs', page, limit],
        queryFn: async () => {
            const response = await api.get<PaginatedLabs>(`/labs?page=${page}&limit=${limit}`);
            return response.data;
        },
    });
};

export const useComponentsByLab = (labId: string | null, page = 1, limit = 10) => {
    return useQuery({
        queryKey: ['components', labId, page, limit],
        queryFn: async () => {
            const response = await api.get<PaginatedComponents>(`/components/${labId}?page=${page}&limit=${limit}`);
            return response.data;
        },
        enabled: !!labId,
    });
};

export const useComponentAvailability = (componentId: string | null, date: string | null) => {
    return useQuery({
        queryKey: ['availability', componentId, date],
        queryFn: async () => {
            const response = await api.get<AvailabilityResponse>(`/components/${componentId}/availability?date=${date}`);
            return response.data;
        },
        enabled: !!componentId && !!date,
    });
};
