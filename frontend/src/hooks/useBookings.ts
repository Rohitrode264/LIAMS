import { api } from '../api/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PaginatedBookings, Booking } from '../types';
import toast from 'react-hot-toast';

export const useBookings = (page = 1, limit = 10) => {
    return useQuery({
        queryKey: ['bookings', page, limit],
        queryFn: async () => {
            const response = await api.get<PaginatedBookings>(`/bookings?page=${page}&limit=${limit}`);
            return response.data;
        },
    });
};

export const useCreateBooking = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { component_id: string; lab_id: string; start: string; end: string; purpose?: string }) => {
            const response = await api.post<{ message: string; booking: Booking }>('/bookings', data);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Booking requested successfully!');
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            queryClient.invalidateQueries({ queryKey: ['availability'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create booking');
        }
    });
};
