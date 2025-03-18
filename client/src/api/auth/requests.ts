import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';
import {
    IUserResponse,
    AuthResponse,
    ErrorResponse,
    LoginData,
    LoginResponse,
    RegisterData,
    RegisterResponse,
    VerifyAccountData,
    EmailData,
    SetNewPasswordData,
    SignInWithOtp,
    GoogleLoginData
} from './types';

// API client setup
const api = axios.create({
    baseURL: '/api/v1/auth',
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
        const err = error as AxiosError<AuthResponse<ErrorResponse>>;
        if (err.response?.data) {
            return err.response.data;
        }
        return { status: 'failure', message: error.message };
    }
    return { status: 'failure', message: 'An unexpected error occurred' };
};

// API functions
export const authApi = {
    register: async (data: RegisterData): Promise<AuthResponse<RegisterResponse>> => {
        try {
            const response = await api.post<AuthResponse<RegisterResponse>>('/register', data);
            return response.data;
        } catch (error) {
            return handleAuthError(error) as AuthResponse<RegisterResponse>;
        }
    },
    verifyAccount: async (data: VerifyAccountData): Promise<AuthResponse<IUserResponse>> => {
        try {
            const response = await api.post<AuthResponse<IUserResponse>>('/verify-email', data);
            return response.data;
        } catch (error) {
            return handleAuthError(error) as AuthResponse<IUserResponse>;
        }
    },
    login: async (data: LoginData): Promise<AuthResponse<LoginResponse>> => {
        try {
            const response = await api.post<AuthResponse<LoginResponse>>('/login', data);
            return response.data;
        } catch (error) {
            return handleAuthError(error) as AuthResponse<LoginResponse>;
        }
    },
    google: async (data: GoogleLoginData): Promise<AuthResponse<LoginResponse>> => {
        try {
            const response = await api.post<AuthResponse<LoginResponse>>('/google', data);
            return response.data;
        } catch (error) {
            return handleAuthError(error) as AuthResponse<LoginResponse>;
        }
    },
    logout: async (): Promise<AuthResponse<null>> => {
        try {
            const response = await api.get<AuthResponse<null>>('/logout');
            return response.data;
        } catch (error) {
            return handleAuthError(error) as AuthResponse<null>;
        }
    },
    validate: async ():Promise<AuthResponse<LoginResponse>> => {
        try {
            const response = await api.get<AuthResponse<LoginResponse>>('/validate');
            return response.data;
        } catch (error) {
            return handleAuthError(error) as AuthResponse<LoginResponse>;
        }
    },
    resendVerificationEmail: async (data: EmailData): Promise<AuthResponse<{ otp: string }>> => {
        try {
            const response = await api.post<AuthResponse<{ otp: string }>>('/resend-verification-email', data);
            return response.data;
        } catch (error) {
            return handleAuthError(error) as AuthResponse<{ otp: string }>;
        }
    },
    sendPasswordResetOtp: async (data: EmailData): Promise<AuthResponse<{ otp: string }>> => {
        try {
            const response = await api.post<AuthResponse<{ otp: string }>>('/send-password-reset-otp', data);
            return response.data;
        } catch (error) {
            return handleAuthError(error) as AuthResponse<{ otp: string }>;
        }
    },
    setNewPassword: async (data: SetNewPasswordData): Promise<AuthResponse<null>> => {
        try {
            const response = await api.post<AuthResponse<null>>('/set-new-password', data);
            return response.data;
        } catch (error) {
            return handleAuthError(error) as AuthResponse<null>;
        }
    },
    sendLoginOtp: async (data: EmailData): Promise<AuthResponse<{ otp: string }>> => {
        try {
            const response = await api.post<AuthResponse<{ otp: string }>>('/send-login-otp', data);
            return response.data;
        } catch (error) {
            return handleAuthError(error) as AuthResponse<{ otp: string }>;
        }
    },
    signInWithOtp: async (data: SignInWithOtp): Promise<AuthResponse<LoginResponse>> => {
        try {
            const response = await api.post<AuthResponse<LoginResponse>>('/login-with-otp', data);
            return response.data;
        } catch (error) {
            return handleAuthError(error) as AuthResponse<LoginResponse>;
        }
    }
};