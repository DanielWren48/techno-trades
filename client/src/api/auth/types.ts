import { IUser } from '@/types';

// Types
export type IUserResponse = Omit<IUser, 'password' | 'otp' | 'otpExpiry'>;

export interface TokensResponse {
    access: string;
    refresh: string;
}

export interface AuthResponse<T> {
    status: 'success' | 'failure';
    message: string;
    code?: string;
    data?: T;
}

export interface LoginResponse {
    user: IUserResponse;
    tokens: TokensResponse;
}

export interface RegisterResponse {
    user: IUserResponse;
    otp: string;
}

export interface ErrorResponse {
    code: string;
    data?: Record<string, string>;
}

// Request types
export interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface GoogleLoginData {
    token: string;
}

export interface VerifyAccountData {
    email: string;
    otp: number;
}

export interface EmailData {
    email: string;
}

export interface SetNewPasswordData {
    email: string;
    otp: string;
    password: string;
}

export interface SignInWithOtp {
    email: string;
    otp: number;
}