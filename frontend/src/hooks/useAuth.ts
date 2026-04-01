import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export const useSignup = () => {
    return useMutation({
        mutationFn: authApi.signup,
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Signup failed');
        }
    });
};

export const useVerifyOtp = () => {
    const setAuth = useAuthStore((state) => state.setAuth);

    return useMutation({
        mutationFn: authApi.verifyOtp,
        onSuccess: (data) => {
            console.log('Verification successful, response data:', data);
            if (data && data.token && data.user) {
                setAuth(data.token, data.user);
                toast.success('Successfully verified & logged in!');
            } else {
                console.error('Verification response missing token or user:', data);
                toast.error('Verification succeeded but session data missing');
            }
        },
        onError: (error: any) => {
            console.error('Verification mutation error:', error);
            toast.error(error.response?.data?.message || 'Verification failed');
        }
    });
};

export const useLogin = () => {
    const setAuth = useAuthStore((state) => state.setAuth);

    return useMutation({
        mutationFn: authApi.login,
        onSuccess: (data) => {
            console.log('Login successful, response data:', data);
            if (data && data.token && data.user) {
                setAuth(data.token, data.user);
                toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
            } else {
                console.error('Login response missing token or user:', data);
                toast.error('Invalid server response during login');
            }
        },
        onError: (error: any) => {
            console.error('Login mutation error:', error);
            toast.error(error.response?.data?.message || 'Login failed');
        }
    });
};
