import { Order } from "@/types/order";

export interface BaseResponse<T> {
    status: 'success' | 'failure';
    message: string;
    code?: string;
    data?: T;
}

export interface ErrorResponse {
    code: string;
    data?: Record<string, string>;
}

export interface File {
    key: string;
    url: string;
}