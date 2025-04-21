import { Order } from "@/types/order";

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