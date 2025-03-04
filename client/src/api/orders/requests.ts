import Cookies from 'js-cookie';
import axios, { AxiosError } from 'axios';
import { Order } from '@/types/order';
import { BaseUserResponse, ErrorResponse, IOrdersResponse, NewOrder, UpdateShippingStatus } from './types';

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
        const err = error as AxiosError<BaseUserResponse<ErrorResponse>>;
        if (err.response?.data) {
            return err.response.data;
        }
        return { status: 'failure', message: error.message };
    }
    return { status: 'failure', message: 'An unexpected error occurred' };
};

// API functions
export const ordersApi = {
    getAllOrders: async (): Promise<BaseUserResponse<IOrdersResponse>> => {
        try {
            const response = await api.get<BaseUserResponse<IOrdersResponse>>('');
            return response.data;
        } catch (error) {
            return handleAuthError(error) as BaseUserResponse<IOrdersResponse>;
        }
    },
    getOrdersBySessionId: async (sessionId: string): Promise<BaseUserResponse<Order>> => {
        try {
            const response = await api.get<BaseUserResponse<Order>>(`/${sessionId}`);
            return response.data;
        } catch (error) {
            return handleAuthError(error) as BaseUserResponse<Order>;
        }
    },
    getMyOrders: async (): Promise<BaseUserResponse<IOrdersResponse>> => {
        try {
            const response = await api.get<BaseUserResponse<IOrdersResponse>>('/my-orders');
            return response.data;
        } catch (error) {
            return handleAuthError(error) as BaseUserResponse<IOrdersResponse>;
        }
    },
    updateShippingStatus: async (data: UpdateShippingStatus): Promise<BaseUserResponse<Order>> => {
        try {
            const response = await axios.patch<BaseUserResponse<Order>>("/update-shipping-status", data);
            return response.data;
        } catch (error) {
            return handleAuthError(error) as BaseUserResponse<Order>;
        }
    },
    // STRIPE ENDPOINTS
    createCheckoutSession: async (data: NewOrder): Promise<string | undefined> => {
        try {
            const { data: responseData } = await axios.post("/api/v1/stripe/create-checkout-session", data);
            if (responseData && responseData.url) {
                window.location.href = responseData.url;
            }
            return responseData;
        } catch (error) {
            console.error("Error during checkout:", error);
        }
    },
    createPaymentIntent: async (data: NewOrder): Promise<string | undefined> => {
        try {
            const response = await axios.post<string | undefined>("/api/v1/stripe/create-payment-intent", data);
            return response.data;
        } catch (error) {
            console.error("Error during checkout:", error);
        }
    },
}
