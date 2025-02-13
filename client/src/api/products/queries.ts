import { INewProduct, Product } from '@/types';
import { authApi } from './requests';
import { useMutation, useQuery } from '@tanstack/react-query'
import { BaseShopResponse } from './types';
import { ErrorResponse } from 'react-router-dom';

enum QUERY_KEYS {
    GET_PRODUCTS = "getProducts",
}

export const useGetProducts = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_PRODUCTS],
        queryFn: authApi.products,
    });
};

export const useCreateNewProduct = () => {
    return useMutation<BaseShopResponse<Product>, BaseShopResponse<ErrorResponse>, INewProduct>({
        mutationFn: authApi.createProduct,
        onSuccess: (response) => {
            console.log({ response });
        },
        onError: (error) => {
            console.error('Validation error:', error);
        }
    });
};