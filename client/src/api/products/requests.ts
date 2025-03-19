import axios from 'axios';
import Cookies from 'js-cookie';
import { BaseShopResponse, AllProductsResponse, ProductQueryParams, ProductFilterBody, UpdateProductDiscount } from './types';
import { INewProduct, Product } from '@/types';

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
export const shopApi = {
    products: async (params?: ProductQueryParams): Promise<BaseShopResponse<AllProductsResponse>> => {
        const response = await api.get<BaseShopResponse<AllProductsResponse>>('/products', {
            params: params
        });
        return response.data;
    },
    filterProducts: async ({ params, filters }: { params?: ProductQueryParams, filters?: ProductFilterBody }): Promise<BaseShopResponse<AllProductsResponse>> => {
        const response = await api.post<BaseShopResponse<AllProductsResponse>>('/products/filter', filters, {
            params: params
        });
        return response.data;
    },
    getProductBySlug: async (slug: string): Promise<BaseShopResponse<Product>> => {
        const response = await api.get<BaseShopResponse<Product>>(`/products/${slug}`);
        return response.data;
    },
    createProduct: async (data: INewProduct): Promise<BaseShopResponse<Product>> => {
        const response = await api.post<BaseShopResponse<Product>>('', data);
        console.log(response)
        return response.data;
    },
    updateDiscount: async (data: UpdateProductDiscount): Promise<BaseShopResponse<Product>> => {
        const response = await api.post<BaseShopResponse<Product>>(`/${data.id}/discount`, data);
        console.log(response)
        return response.data;
    },
}
