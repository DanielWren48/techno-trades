import { IUser } from '@/types';
import Cookies from 'js-cookie';
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { Navigate } from 'react-router-dom';

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

// Token response interface
interface TokenResponse {
    user: any;
    access: string;
    refresh: string;
}

// API client configuration options
interface ApiClientOptions {
    baseURL: string;
    withCredentials?: boolean;
    useTokenAuth?: boolean;
    accessTokenName?: string;
    refreshTokenName?: string;
    defaultHeaders?: Record<string, string>;
}

// API Client Creator
class ApiClient {
    private instance: AxiosInstance;
    private options: ApiClientOptions;
    private isRefreshing = false;
    private failedQueue: Array<{
        resolve: (value: unknown) => void;
        reject: (reason?: any) => void;
        config: AxiosRequestConfig;
    }> = [];

    constructor(options: ApiClientOptions) {
        this.options = {
            withCredentials: true,
            useTokenAuth: true,
            accessTokenName: 'accessToken',
            refreshTokenName: 'refreshToken',
            ...options
        };

        // Create axios instance
        this.instance = axios.create({
            baseURL: this.options.baseURL,
            withCredentials: this.options.withCredentials,
            headers: this.options.defaultHeaders || {}
        });

        // Add request interceptor for authentication
        this.instance.interceptors.request.use(
            (config) => {
                if (this.options.useTokenAuth) {
                    const accessToken = Cookies.get(this.options.accessTokenName || 'accessToken');
                    console.log({ accessToken })
                    if (accessToken) {
                        config.headers.Authorization = `Bearer ${accessToken}`;
                    }
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Add response interceptor for handling auth errors and token refresh
        this.instance.interceptors.response.use((response) => response,
            async (error) => {
                const originalRequest = error.config;
                console.log({ originalRequest })

                // If error is not 401 or we've already tried to refresh, reject the promise
                if (!error.response || error.response.status !== 401 || originalRequest._retry) {
                    console.log({ error })
                    return Promise.reject(error);
                }

                // If we're already refreshing, add this request to the queue
                if (this.isRefreshing) {
                    return new Promise((resolve, reject) => {
                        this.failedQueue.push({ resolve, reject, config: originalRequest });
                    });
                }

                originalRequest._retry = true;
                this.isRefreshing = true;

                try {
                    // Get refresh token from cookies
                    const refreshToken = Cookies.get(this.options.refreshTokenName || 'refreshToken');
                    console.log({ refreshToken })

                    if (!refreshToken) {
                        throw new Error('No refresh token available');
                    }

                    // Call refresh token endpoint
                    const response = await axios.post<BaseResponse<TokenResponse>>(
                        '/api/v1/auth/refresh',
                        { refresh: refreshToken },
                        { withCredentials: true }
                    );
                    console.log({ response })

                    if (response.data.status === 'success' && response.data.data) {
                        // Process the queue of failed requests
                        this.processQueue(null, originalRequest);

                        // Retry the original request
                        return this.instance(originalRequest);
                    } else {
                        // If refresh failed, redirect to login
                        this.processQueue(new Error('Refresh token failed'), null);
                        this.redirectToLogin();
                        return Promise.reject(error);
                    }
                } catch (refreshError) {
                    //@ts-expect-error
                    this.processQueue(refreshError, null);
                    this.redirectToLogin();
                    return Promise.reject(refreshError);
                } finally {
                    this.isRefreshing = false;
                }
            }
        );
    }

    // Process queued requests after refresh attempt
    private processQueue(error: Error | null, originalRequest: AxiosRequestConfig | null) {
        this.failedQueue.forEach((promise) => {
            if (error) {
                promise.reject(error);
            } else {
                promise.resolve(this.instance(promise.config));
            }
        });

        this.failedQueue = [];
    }

    // Redirect to login when auth completely fails
    private redirectToLogin() {
        // Clear auth cookies
        Cookies.remove(this.options.accessTokenName || 'accessToken');
        Cookies.remove(this.options.refreshTokenName || 'refreshToken');

        console.warn('Authentication failed. Redirecting to login...');
        Navigate({ to: "/auth/sign-in", replace: true })
    }

    // Generic error handler
    private handleError = (error: unknown): BaseResponse<any> => {
        if (axios.isAxiosError(error)) {
            const err = error as AxiosError<BaseResponse<ErrorResponse>>;
            if (err.response?.data) {
                return err.response.data;
            }
            return {
                status: 'failure',
                message: error.message,
                code: `HTTP_${err.response?.status || 'UNKNOWN'}`
            };
        }
        return {
            status: 'failure',
            message: error instanceof Error ? error.message : 'An unexpected error occurred',
            code: 'UNKNOWN_ERROR'
        };
    }

    // Generic GET method
    async get<T>(url: string, params?: any, config?: Omit<AxiosRequestConfig, 'params'>): Promise<BaseResponse<T>> {
        try {
            const response = await this.instance.get<BaseResponse<T>>(url, {
                params,
                ...config
            });
            console.log({ response })
            return response.data;
        } catch (error) {
            return this.handleError(error) as BaseResponse<T>;
        }
    }

    // Generic POST method
    async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<BaseResponse<T>> {
        try {
            const response = await this.instance.post<BaseResponse<T>>(url, data, config);
            return response.data;
        } catch (error) {
            return this.handleError(error) as BaseResponse<T>;
        }
    }

    // Generic PATCH method
    async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<BaseResponse<T>> {
        try {
            const response = await this.instance.patch<BaseResponse<T>>(url, data, config);
            return response.data;
        } catch (error) {
            return this.handleError(error) as BaseResponse<T>;
        }
    }

    // Generic PUT method
    async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<BaseResponse<T>> {
        try {
            const response = await this.instance.put<BaseResponse<T>>(url, data, config);
            return response.data;
        } catch (error) {
            return this.handleError(error) as BaseResponse<T>;
        }
    }

    // Generic DELETE method
    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<BaseResponse<T>> {
        try {
            const response = await this.instance.delete<BaseResponse<T>>(url, config);
            return response.data;
        } catch (error) {
            return this.handleError(error) as BaseResponse<T>;
        }
    }
}