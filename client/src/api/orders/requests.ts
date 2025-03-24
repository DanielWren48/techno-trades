import Cookies from 'js-cookie';
import axios, { AxiosError } from 'axios';
import { Order } from '@/types/order';
import { BaseResponse, ErrorResponse, IOrderResponse, IOrdersResponse, UpdateShippingStatus } from './types';

// API client setup
const api = axios.create({
    baseURL: '/api/v1/orders',
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
export const ordersApi = {
    getAllOrders: async (): Promise<BaseResponse<IOrdersResponse>> => {
        try {
            const response = await api.get<BaseResponse<IOrdersResponse>>('');
            return response.data;
        } catch (error) {
            return handleAuthError(error) as BaseResponse<IOrdersResponse>;
        }
    },
    getOrdersBySessionId: async (sessionId: string): Promise<BaseResponse<IOrderResponse>> => {
        try {
            const response = await api.get<BaseResponse<IOrderResponse>>(`/${sessionId}`);
            return response.data;
        } catch (error) {
            return handleAuthError(error) as BaseResponse<IOrderResponse>;
        }
    },
    getMyOrders: async (): Promise<BaseResponse<IOrdersResponse>> => {
        try {
            const response = await api.get<BaseResponse<IOrdersResponse>>('/my-orders');
            return response.data;
        } catch (error) {
            return handleAuthError(error) as BaseResponse<IOrdersResponse>;
        }
    },
    updateShippingStatus: async (data: UpdateShippingStatus): Promise<BaseResponse<Order>> => {
        try {
            const response = await api.patch<BaseResponse<Order>>('/update-shipping-status', data);
            return response.data;
        } catch (error) {
            return handleAuthError(error) as BaseResponse<Order>;
        }
    },
}
