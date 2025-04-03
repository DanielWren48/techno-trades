import Cookies from 'js-cookie';
import axios, { AxiosInstance, AxiosError } from 'axios';

// Generic response type
export interface BaseResponse<T> {
    status: 'success' | 'failure';
    message: string;
    code?: string;
    data?: T;
}

// Generic error response
export interface ErrorResponse {
    code: string;
    data?: Record<string, string>;
}

// API client configuration options
interface ApiClientOptions {
    baseURL: string;
    withCredentials?: boolean;
    useTokenAuth?: boolean;
    tokenName?: string;
    defaultHeaders?: Record<string, string>;
}

// API Client Creator
class ApiClient {
    private instance: AxiosInstance;
    private options: ApiClientOptions;

    constructor(options: ApiClientOptions) {
        this.options = {
            withCredentials: true,
            useTokenAuth: true,
            tokenName: 'accessToken',
            ...options
        };

        // Create axios instance
        this.instance = axios.create({
            baseURL: this.options.baseURL,
            withCredentials: this.options.withCredentials,
            headers: this.options.defaultHeaders || {}
        });

        // Add request interceptor
        this.instance.interceptors.request.use(
            (config) => {
                const accessToken = Cookies.get('accessToken');
                if (accessToken) {
                    config.headers['Authorization'] = `Bearer ${accessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );
    }

    // Generic error handler
    private handleError = (error: unknown) => {
        if (axios.isAxiosError(error)) {
            const err = error as AxiosError<BaseResponse<ErrorResponse>>;
            if (err.response?.data) {
                return err.response.data;
            }
            return { status: 'failure', message: error.message };
        }
        return { status: 'failure', message: 'An unexpected error occurred' };
    }

    // Generic GET method
    async get<T>(url: string, params?: any): Promise<BaseResponse<T>> {
        try {
            const response = await this.instance.get<BaseResponse<T>>(url, { params });
            console.log({ response })
            return response.data;
        } catch (error) {
            return this.handleError(error) as BaseResponse<T>;
        }
    }

    // Generic POST method
    async post<T>(url: string, data: any, config?: { params?: any, [key: string]: any }): Promise<BaseResponse<T>> {
        try {
            const response = await this.instance.post<BaseResponse<T>>(url, data, config);
            console.log({ response })
            return response.data;
        } catch (error) {
            return this.handleError(error) as BaseResponse<T>;
        }
    }

    // Generic PATCH method
    async patch<T>(url: string, data: any, params?: any): Promise<BaseResponse<T>> {
        try {
            const response = await this.instance.patch<BaseResponse<T>>(url, data, { params });
            console.log({ response })
            return response.data;
        } catch (error) {
            return this.handleError(error) as BaseResponse<T>;
        }
    }

    // Generic DELETE method
    async delete<T>(url: string, config?: { params?: any, [key: string]: any }): Promise<BaseResponse<T>> {
        try {
            const response = await this.instance.delete<BaseResponse<T>>(url, config);
            return response.data;
        } catch (error) {
            return this.handleError(error) as BaseResponse<T>;
        }
    }
}