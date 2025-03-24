import Cookies from 'js-cookie';
import axios, { AxiosError } from 'axios';
import { BaseResponse, ErrorResponse, File } from './types';

// API client setup
const api = axios.create({
    baseURL: '/api/v1/media',
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
        const err = error as AxiosError<BaseResponse<ErrorResponse>>;
        if (err.response?.data) {
            return err.response.data;
        }
        return { status: 'failure', message: error.message };
    }
    return { status: 'failure', message: 'An unexpected error occurred' };
};

// API functions
export const medaiApi = {
    getAllFiles: async (): Promise<BaseResponse<null>> => {
        try {
            const response = await api.get<BaseResponse<null>>('');
            return response.data;
        } catch (error) {
            return handleAuthError(error) as BaseResponse<null>;
        }
    },
    getFileByKey: async (key: string): Promise<BaseResponse<File[]>> => {
        try {
            const response = await api.get<BaseResponse<File[]>>(`/:${key}`);
            return response.data;
        } catch (error) {
            return handleAuthError(error) as BaseResponse<File[]>;
        }
    },
    deleteFiles: async (fileKeys: string[]): Promise<BaseResponse<null>> => {
        try {
            const response = await api.delete<BaseResponse<null>>('', {
                data: { fileKeys },
            });
            return response.data;
        } catch (error) {
            return handleAuthError(error) as BaseResponse<null>;
        }
    },
}


