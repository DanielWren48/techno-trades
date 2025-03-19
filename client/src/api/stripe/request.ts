import Cookies from 'js-cookie';
import axios from 'axios';
import { NewOrder } from './types';

// API client setup
const api = axios.create({
    baseURL: '/api/v1/stripe',
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
export const stripeApi = {
    createCheckoutSession: async (data: NewOrder): Promise<string | undefined> => {
        try {
            const { data: responseData } = await api.post("/create-checkout-session", data);
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
            const response = await api.post("/create-payment-intent", data);
            return response.data.clientSecret
        } catch (error) {
            console.error("Error during checkout:", error);
        }
    },
}
