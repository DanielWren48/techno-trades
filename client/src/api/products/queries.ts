import { authApi } from './requests';
import { useQuery } from '@tanstack/react-query'

enum QUERY_KEYS {
    GET_PRODUCTS = "getProducts",
}

export const useGetProducts = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_PRODUCTS],
        queryFn: authApi.products,
    });
};
