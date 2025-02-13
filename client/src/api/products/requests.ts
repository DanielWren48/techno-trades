import axios from 'axios';
import Cookies from 'js-cookie';
import { BaseShopResponse, AllProductsResponse } from './types';

// API client setup
const api = axios.create({
    baseURL: '/api/v1/shop',
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
export const authApi = {
    products: async (): Promise<BaseShopResponse<AllProductsResponse>> => {
        const response = await api.get<BaseShopResponse<AllProductsResponse>>('/products');
        // console.log(response.data.data)
        return response.data;
    },
}
