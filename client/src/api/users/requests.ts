import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import { BaseUserResponse, ErrorResponse, IUserResponse, UpdateUserEmail, UpdateUserPassword, UpdateUserProfile } from './types';
import { IUser } from '@/types';

// API client setup
const api = axios.create({
    baseURL: '/api/v1/users',
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const accessToken = Cookies.get('accessToken');
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Custom error handler
const handleAuthError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
        const err = error as AxiosError<BaseUserResponse<ErrorResponse>>;
        if (err.response?.data) {
            return err.response.data;
        }
        return { status: 'failure', message: error.message };
    }
    return { status: 'failure', message: 'An unexpected error occurred' };
};

// API functions
export const usersApi = {
    getAllUsers: async (): Promise<BaseUserResponse<IUserResponse>> => {
        try {
            const response = await api.get<BaseUserResponse<IUserResponse>>('');
            return response.data;
        } catch (error) {
            return handleAuthError(error) as BaseUserResponse<IUserResponse>;
        }
    },
    updateUserDetails: async (data: UpdateUserProfile): Promise<BaseUserResponse<IUser>> => {
        try {
            const response = await api.patch<BaseUserResponse<IUser>>('/update-me', data);
            return response.data;
        } catch (error) {
            return handleAuthError(error) as BaseUserResponse<IUser>;
        }
    },
    sendEmailChangeOtp: async (): Promise<BaseUserResponse<number>> => {
        try {
            const response = await api.post<BaseUserResponse<number>>('/send-email-change-otp');
            console.log(response)
            return response.data;
        } catch (error) {
            return handleAuthError(error) as BaseUserResponse<number>;
        }
    },
    updateUserEmail: async (data: UpdateUserEmail): Promise<BaseUserResponse<IUser>> => {
        try {
            const response = await api.patch<BaseUserResponse<IUser>>('/update-my-email', data);
            console.log(response)
            return response.data;
        } catch (error) {
            return handleAuthError(error) as BaseUserResponse<IUser>;
        }
    },
    updateUserPassword: async (data: UpdateUserPassword): Promise<BaseUserResponse<IUser>> => {
        try {
            const response = await api.patch<BaseUserResponse<IUser>>('/update-my-password', data);
            console.log(response)
            return response.data;
        } catch (error) {
            return handleAuthError(error) as BaseUserResponse<IUser>;
        }
    }
}
