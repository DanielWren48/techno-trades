import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BaseResponse, ErrorResponse, ordersApiEndpoints } from "../client";
import { UpdateShippingStatus } from "../types/order";
import { Order } from "@/types/order";

export enum QUERY_KEYS {
    // ORDER KEYS
    GET_MY_ORDERS = "getMyOrders",
    GET_ORDERS = "getOrders",
    GET_ORDER_BY_SESSION_ID = "getOrderBySessionId",
}

export const useGetOrders = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_ORDERS],
        queryFn: () => ordersApiEndpoints.getAllOrders()
    });
};

export const useGetMyOrders = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_MY_ORDERS],
        queryFn: () => ordersApiEndpoints.getMyOrders()
    });
};

export const useGetOrderBySessionId = (sessionId: string | null) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_ORDER_BY_SESSION_ID, sessionId],
        queryFn: () => ordersApiEndpoints.getOrdersBySessionId(sessionId!),
        enabled: !!sessionId,
    });
};

export const useUpdateShippingStatus = () => {
    const queryClient = useQueryClient();
    return useMutation<BaseResponse<Order>, BaseResponse<ErrorResponse>, UpdateShippingStatus>({
        mutationFn: ordersApiEndpoints.updateShippingStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_ORDERS],
            });
        },
        onError: (error) => {
            console.error('Validation error:', error);
        }
    });
};