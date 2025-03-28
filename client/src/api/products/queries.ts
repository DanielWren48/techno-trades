import { INewProduct, INewReview, Product } from '@/types';
import { shopApi} from './requests';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BaseShopResponse, CreateReview, ProductFilterBody, ProductQueryParams, UpdateProduct, UpdateProductDiscount } from './types';
import { ErrorResponse } from 'react-router-dom';

enum QUERY_KEYS {
    GET_PRODUCTS = "getProducts",
    GET_PRODUCT_BY_SLUG = "getProductBySlug",
    FILTER_PRODUCTS = "getFilteredProducts",
    GET_SIMILAR_PRODUCTS = "getSimilarProducts",
}

export const useGetProducts = (params?: ProductQueryParams) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_PRODUCTS, params],
        queryFn: () => shopApi.products(params),
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false
    });
};

export const useSearchProduct = ({ filters }: { filters?: ProductFilterBody }) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_SIMILAR_PRODUCTS, filters],
        queryFn: () => shopApi.filterProducts({ filters }),
        enabled: !!filters?.name,
    });
};

export const useGetProductBySlug = (slug: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_PRODUCT_BY_SLUG, slug],
        queryFn: () => shopApi.getProductBySlug(slug),
        enabled: !!slug,
    });
};

export const useGetSimimarProducts = (
    { params, filters, currentProductId }:
        { params?: ProductQueryParams, filters?: ProductFilterBody, currentProductId: string | undefined, }
) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_SIMILAR_PRODUCTS, { params, filters }],
        queryFn: () => shopApi.filterProducts({ params, filters }),
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

export const useFilterProducts = ({ params, filters }: { params?: ProductQueryParams, filters?: ProductFilterBody }) => {
    return useQuery({
        queryKey: [QUERY_KEYS.FILTER_PRODUCTS, { params, filters }],
        queryFn: () => shopApi.filterProducts({ params, filters }),
    });
};

export const useCreateNewProduct = () => {
    return useMutation<BaseShopResponse<Product>, BaseShopResponse<ErrorResponse>, INewProduct>({
        mutationFn: shopApi.createProduct,
        onSuccess: (response) => {
            console.log({ response });
        },
        onError: (error) => {
            console.error('Validation error:', error);
        }
    });
};

export const useSetProductDiscount = () => {
    const queryClient = useQueryClient();
    return useMutation<BaseShopResponse<Product>, BaseShopResponse<ErrorResponse>, UpdateProductDiscount>({
        mutationFn: shopApi.updateDiscount,
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_PRODUCTS],
            });
        },
        onError: (error) => {
            console.error('Validation error:', error);
        }
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation<BaseShopResponse<Product>, BaseShopResponse<ErrorResponse>, UpdateProduct>({
        mutationFn: shopApi.updateProductById,
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_PRODUCTS],
            });
        },
        onError: (error) => {
            console.error('Validation error:', error);
        }
    });
};

export const useCreateProductReview = () => {
    const queryClient = useQueryClient();
    return useMutation<BaseShopResponse<INewReview>, BaseShopResponse<ErrorResponse>, CreateReview>({
        mutationFn: shopApi.createReview,
        onSuccess: (response) => {
            if (response.status === 'success' && response.data) {
                const slug = response.data.slug
                queryClient.invalidateQueries({
                    queryKey: [QUERY_KEYS.GET_PRODUCT_BY_SLUG, slug],
                });
            }
        },
        onError: (error) => {
            console.error('Validation error:', error);
        }
    });
};