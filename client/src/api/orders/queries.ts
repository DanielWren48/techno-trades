import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "./requests";

export enum QUERY_KEYS {
    // ORDER KEYS
    GET_MY_ORDERS = "getMyOrders",
    GET_ORDERS = "getOrders",
    GET_ORDER_BY_SESSION_ID = "getOrderBySessionId",
}

export const useGetOrderBySessionId = (sessionId: string | null) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_ORDER_BY_SESSION_ID, sessionId],
        queryFn: () => ordersApi.getOrdersBySessionId(sessionId!),
        enabled: !!sessionId,
    });
};