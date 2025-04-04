import { IUser } from "@/types";

export interface BaseUserResponse<T> {
    status: 'success' | 'failure';
    message: string;
    code?: string;
    data?: T;
}

export interface IUserResponse {
    users: IUser[];
}

export interface ErrorResponse {
    code: string;
    data?: Record<string, string>;
}

export interface UpdateUserProfile {
    firstName: string | undefined;
    lastName: string | undefined;
    avatar?: string | null;
}

export interface UpdateUserEmail {
    email: string;
    otp: number;
}

export interface UpdateUserPassword {
    passwordCurrent: string;
    password: string;
    passwordConfirm: string;
}