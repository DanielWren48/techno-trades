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