import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios';
import { BookingStatus } from '../types';
import toast from 'react-hot-toast';

export const useUpdateBookingStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            {
                bookingId,
                status,
                assigned_to,
                rejection_reason
            }: {
                bookingId: string,
                status: BookingStatus,
                assigned_to?: string,
                rejection_reason?: string
            }
        ) => {
            const response = await api.patch(`/bookings/${bookingId}/status`, { status, assigned_to, rejection_reason });
            return response.data;
        },
        onSuccess: (_, variables) => {
            toast.success(`Booking marked as ${variables.status}`);
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            queryClient.invalidateQueries({ queryKey: ['availability'] }); // Might free up slots if rejected/cancelled
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    });
};

export const useCompleteBooking = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ bookingId }: { bookingId: string }) => {
            const response = await api.patch(`/bookings/${bookingId}/complete`);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Booking marked as completed');
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            queryClient.invalidateQueries({ queryKey: ['availability'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to complete booking');
        }
    });
};

export const useCancelBooking = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ bookingId }: { bookingId: string }) => {
            const response = await api.patch(`/bookings/${bookingId}/cancel`);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Booking cancelled');
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
            queryClient.invalidateQueries({ queryKey: ['availability'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to cancel booking');
        }
    });
};
