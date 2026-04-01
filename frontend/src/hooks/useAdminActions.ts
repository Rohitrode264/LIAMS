import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/axios';
import toast from 'react-hot-toast';
import type { UserRole } from '../types';

export const useCreateLab = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { name: string; description?: string; location?: string; incharge_id?: string; assistant_ids?: string[] }) => {
            const response = await api.post('/labs', data);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Lab created successfully');
            queryClient.invalidateQueries({ queryKey: ['labs'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create lab');
        }
    });
};

export const useCreateComponent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { lab_id: string; name: string; description?: string; status?: string }) => {
            const response = await api.post('/components', data);
            return response.data;
        },
        onSuccess: (_, variables) => {
            toast.success('Component added successfully');
            queryClient.invalidateQueries({ queryKey: ['components', variables.lab_id] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to add component');
        }
    });
};

export const useUpdateComponent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { id: string; name?: string; description?: string; status?: string }) => {
            const { id, ...patch } = data;
            const response = await api.patch(`/components/${id}`, patch);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Component updated');
            queryClient.invalidateQueries({ queryKey: ['components'] });
            // if caller knows lab_id, it will be part of query keys; broad invalidation is ok here for admin.
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update component');
        }
    });
};

export const useUpdateLab = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { id: string; name?: string; description?: string; location?: string; status?: string; incharge_id?: string; assistant_ids?: string[] }) => {
            const { id, ...patch } = data;
            const response = await api.patch(`/labs/${id}`, patch);
            return response.data;
        },
        onSuccess: () => {
            toast.success('Lab updated');
            queryClient.invalidateQueries({ queryKey: ['labs'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update lab');
        }
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { id: string; name?: string; roles?: UserRole[]; status?: string; labs_assigned?: string[] }) => {
            const { id, ...patch } = data;
            const response = await api.patch(`/users/${id}`, patch);
            return response.data;
        },
        onSuccess: () => {
            toast.success('User updated');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['labs'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update user');
        }
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: { name: string; email: string; password: string; roles: UserRole[]; labs_assigned?: string[] }) => {
            const response = await api.post('/users', data);
            return response.data;
        },
        onSuccess: () => {
            toast.success('User created successfully');
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['labs'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to create user');
        }
    });
};
