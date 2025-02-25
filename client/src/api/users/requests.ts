import axios from 'axios';
import Cookies from 'js-cookie';
import { BaseUserResponse, IUserResponse, UpdateUserProfile } from './types';
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

// API functions
export const usersApi = {
    getAllUsers: async (): Promise<BaseUserResponse<IUserResponse>> => {
        const response = await api.get<BaseUserResponse<IUserResponse>>('');
        return response.data;
    },
    updateUserDetails: async (data: UpdateUserProfile): Promise<BaseUserResponse<IUser>> => {
        const response = await api.patch<BaseUserResponse<IUser>>('/update-me', data);
        return response.data;
    }
}
