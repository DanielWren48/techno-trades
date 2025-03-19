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

export interface IOrdersResponse {
    orders: Order[];
}

export interface IOrderResponse {
    order: Order;
}

export interface UpdateShippingStatus {
    orderId: string;
    status: string;
}