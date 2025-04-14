import { IUser } from '@/types';
import Cookies from 'js-cookie';
import { Order } from '@/types/order';
import { INewProduct, INewReview, Product } from '@/types';
import { CreateCheckout, NewOrder } from './stripe/types';
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { UpdateUserEmail, UpdateUserPassword, UpdateUserProfile } from './users/types';
import { IOrderResponse, IOrdersResponse, UpdateShippingStatus } from './orders/types';
import { AllProductsResponse, ProductQueryParams, ProductFilterBody, UpdateProductDiscount, UpdateProduct, CreateReview } from './products/types';
import { IUserResponse, LoginData, LoginResponse, RegisterData, RegisterResponse, VerifyAccountData, EmailData, SetNewPasswordData, SignInWithOtp, GoogleLoginData } from './auth/types';

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
    user: IUser;
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

    // Event system for auth state changes
    private authStateListeners: Array<(isAuthenticated: boolean) => void> = [];

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
        this.instance.interceptors.response.use(
            (response) => response,
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
                        this.notifyAuthStateChange(false);
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
                        this.notifyAuthStateChange(true);

                        // Retry the original request
                        return this.instance(originalRequest);
                    } else {
                        // If refresh failed, notify about auth state change
                        this.processQueue(new Error('Refresh token failed'), null);
                        this.notifyAuthStateChange(false);
                        return Promise.reject(error);
                    }
                } catch (refreshError) {
                    //@ts-expect-error
                    this.processQueue(refreshError, null);
                    this.notifyAuthStateChange(false);
                    return Promise.reject(refreshError);
                } finally {
                    this.isRefreshing = false;
                }
            }
        );
    }

    // Add listener for auth state changes
    public onAuthStateChange(callback: (isAuthenticated: boolean) => void) {
        this.authStateListeners.push(callback);
        return () => {
            this.authStateListeners = this.authStateListeners.filter(cb => cb !== callback);
        };
    }

    // Notify listeners about auth state changes
    private notifyAuthStateChange(isAuthenticated: boolean) {
        this.authStateListeners.forEach(callback => callback(isAuthenticated));
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

    // Clear auth tokens and notify about state change
    public clearAuthTokens() {
        Cookies.remove(this.options.accessTokenName || 'accessToken');
        Cookies.remove(this.options.refreshTokenName || 'refreshToken');
        this.notifyAuthStateChange(false);
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

// Create shared API client for auth
const authApi = new ApiClient({ baseURL: '/api/v1/auth' });
const shopApi = new ApiClient({ baseURL: '/api/v1/shop' });
const usersApi = new ApiClient({ baseURL: '/api/v1/users' })
const mediaApi = new ApiClient({ baseURL: '/api/v1/media' });
const ordersApi = new ApiClient({ baseURL: '/api/v1/orders' });
const stripeApi = new ApiClient({ baseURL: '/api/v1/stripe' });

// Export the shared instance
export const authApiService = {
    register: (data: RegisterData) => authApi.post<RegisterResponse>('/register', data),
    verifyAccount: (data: VerifyAccountData) => authApi.post<IUserResponse>('/verify-email', data),
    login: (data: LoginData) => authApi.post<LoginResponse>('/login', data),
    google: (data: GoogleLoginData) => authApi.post<LoginResponse>('/google', data),
    logout: () => authApi.get<null>('/logout'),
    validate: () => authApi.get<LoginResponse>('/validate'),
    resendVerificationEmail: (data: EmailData) => authApi.post<{ otp: string }>('/resend-verification-email', data),
    sendPasswordResetOtp: (data: EmailData) => authApi.post<{ otp: string }>('/send-password-reset-otp', data),
    setNewPassword: (data: SetNewPasswordData) => authApi.post<null>('/set-new-password', data),
    sendLoginOtp: (data: EmailData) => authApi.post<{ otp: string }>('/send-login-otp', data),
    signInWithOtp: (data: SignInWithOtp) => authApi.post<LoginResponse>('/login-with-otp', data),

    validateUser: () => authApi.get<any>('/validate'),
    refreshToken: (refreshToken: string) => authApi.post<LoginResponse>('/refresh', { refresh: refreshToken }),
    clearAuthTokens: () => authApi.clearAuthTokens(),
    onAuthStateChange: authApi.onAuthStateChange.bind(authApi),
};

export const shopApiEndpoints = {
    products: (params?: ProductQueryParams) => shopApi.get<AllProductsResponse>('/products', params),
    filterProducts: ({ params, filters }: { params?: ProductQueryParams, filters?: ProductFilterBody }) => shopApi.post<AllProductsResponse>('/products/filter', filters, { params }),
    getProductBySlug: (slug: string) => shopApi.get<Product>(`/products/${slug}`),
    createProduct: (data: INewProduct) => shopApi.post<Product>('', data),
    updateDiscount: (data: UpdateProductDiscount) => shopApi.patch<Product>(`/products/${data.id}/discount`, data),
    updateProductById: (data: UpdateProduct) => shopApi.patch<Product>(`/products/${data.id}/update`, data),
    createReview: (data: CreateReview) => shopApi.post<INewReview>(`/products/${data.slug}`, data)
};

export const usersAiEndpoints = {
    getAllUsers: () => usersApi.get<IUserResponse>(''),
    updateUserDetails: (data: UpdateUserProfile) => usersApi.patch<IUser>('/update-me', data),
    sendEmailChangeOtp: () => usersApi.post<number>('/send-email-change-otp', null),
    updateUserEmail: (data: UpdateUserEmail) => usersApi.patch<IUser>('/update-my-email', data),
    updateUserPassword: (data: UpdateUserPassword) => usersApi.patch<IUser>('/update-my-password', data),
    closeUserAccount: () => usersApi.delete<null>('/deactivate-me')
};
export const mediaApiEndpoints = {
    getAllFiles: () => mediaApi.get<null>(''),
    getFileByKey: (key: string) => mediaApi.get<File[]>(`/:${key}`),
    deleteFiles: (fileKeys: string[]) => mediaApi.delete<null>('/', { data: fileKeys })
};

export const ordersApiEndpoints = {
    getAllOrders: () => ordersApi.get<IOrdersResponse>(''),
    getOrdersBySessionId: (sessionId: string) => ordersApi.get<IOrderResponse>(`/${sessionId}`),
    getMyOrders: () => ordersApi.get<IOrdersResponse>('/my-orders'),
    updateShippingStatus: (data: UpdateShippingStatus) => ordersApi.patch<Order>('/update-shipping-status', data),
}

export const stripeApiEndpoints = {
    createPaymentIntent: (data: NewOrder) => stripeApi.post<CreateCheckout>('/create-payment-intent', data),
}