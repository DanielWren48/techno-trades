import { INewProduct, Product } from '@/types';
import { authApi } from './requests';
import { useMutation, useQuery } from '@tanstack/react-query'
import { BaseShopResponse, ProductFilterBody, ProductQueryParams } from './types';
import { ErrorResponse } from 'react-router-dom';

enum QUERY_KEYS {
    GET_PRODUCTS = "getProducts",
    GET_PRODUCT_BY_SLUG = "getProductBySlug",
    FILTER_PRODUCTS = "getFilteredProducts",
}

export const useGetProducts = (params?: ProductQueryParams) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_PRODUCTS, params],
        queryFn: () => authApi.products(params),
    });
};

export const useGetProductBySlug = (slug: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_PRODUCT_BY_SLUG, slug],
        queryFn: () => authApi.getProductBySlug(slug),
        enabled: !!slug,
    });
};

export const useFilterProducts = (
    { params, filters, currentProductId }:
        { params?: ProductQueryParams, filters?: ProductFilterBody, currentProductId: string | undefined, }
) => {
    return useQuery({
        queryKey: [QUERY_KEYS.FILTER_PRODUCTS, { params, filters }],
        queryFn: () => authApi.filterProducts({ params, filters }),
        enabled: !!currentProductId,
        select: (data) => ({
            ...data,
            data: {
                ...data.data,
                // Filter out the current product from similar products
                items: data.data?.items?.filter(item => item._id !== currentProductId)
            }
        })
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