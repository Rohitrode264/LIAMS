import { api } from './axios';
import type { AuthResponse, User } from '../types';

export const authApi = {
    signup: async (data: any): Promise<{ message: string; pendingUserId: string }> => {
        const response = await api.post('/auth/signup', data);
        return response.data;
    },

    verifyOtp: async (data: { pendingUserId: string; otp: string }): Promise<AuthResponse & { user: User }> => {
        const response = await api.post('/auth/verify-otp', data);
        return response.data;
    },

    login: async (data: any): Promise<AuthResponse & { user: User }> => {
        const response = await api.post('/auth/login', data);
        return response.data;
    }
};
