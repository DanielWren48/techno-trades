import { INewProduct, INewReview, Product } from '@/types';
import { BaseResponse, ErrorResponse, shopApiEndpoints } from '../client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CreateReview, DeleteReview, ProductFilterBody, ProductQueryParams, UpdateProduct, UpdateProductDiscount, UpdateProductStock } from '../types/product';

enum QUERY_KEYS {
    GET_PRODUCTS = "getProducts",
    GET_PRODUCT_BY_SLUG = "getProductBySlug",
    FILTER_PRODUCTS = "getFilteredProducts",
    GET_SIMILAR_PRODUCTS = "getSimilarProducts",
}

export const useGetProducts = (params?: ProductQueryParams) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_PRODUCTS, params],
        queryFn: () => shopApiEndpoints.products(params),
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false
    });
};

export const useSearchProduct = ({ filters }: { filters?: ProductFilterBody }) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_SIMILAR_PRODUCTS, filters],
        queryFn: () => shopApiEndpoints.filterProducts({ filters }),
        enabled: !!filters?.name,
    });
};

export const useGetProductBySlug = (slug: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_PRODUCT_BY_SLUG, slug],
        queryFn: () => shopApiEndpoints.getProductBySlug(slug),
        enabled: !!slug,
    });
};

export const useGetSimimarProducts = (
    { params, filters, currentProductId }:
        { params?: ProductQueryParams, filters?: ProductFilterBody, currentProductId: string | undefined, }
) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_SIMILAR_PRODUCTS, { params, filters }],
        queryFn: () => shopApiEndpoints.filterProducts({ params, filters }),
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
        queryFn: () => shopApiEndpoints.filterProducts({ params, filters }),
    });
};

export const useCreateNewProduct = () => {
    return useMutation<BaseResponse<Product>, BaseResponse<ErrorResponse>, INewProduct>({
        mutationFn: shopApiEndpoints.createProduct,
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
    return useMutation<BaseResponse<Product>, BaseResponse<ErrorResponse>, UpdateProductDiscount>({
        mutationFn: shopApiEndpoints.updateDiscount,
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

export const useUpdateProductStock = () => {
    const queryClient = useQueryClient();
    return useMutation<BaseResponse<Product>, BaseResponse<ErrorResponse>, UpdateProductStock>({
        mutationFn: shopApiEndpoints.updateStock,
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
    return useMutation<BaseResponse<Product>, BaseResponse<ErrorResponse>, UpdateProduct>({
        mutationFn: shopApiEndpoints.updateProductById,
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
    return useMutation<BaseResponse<INewReview>, BaseResponse<ErrorResponse>, CreateReview>({
        mutationFn: shopApiEndpoints.createReview,
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

export const useDeleteProductReviewById = () => {
    const queryClient = useQueryClient();
    return useMutation<BaseResponse<null>, BaseResponse<ErrorResponse>, DeleteReview>({
        mutationFn: shopApiEndpoints.deleteReviewById,
        onSuccess: (response) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_PRODUCTS],
            });
        },
        onError: (error) => {
            console.error('Validation error:', error);
        }
    });
};

export const useDeleteProductById = () => {
    const queryClient = useQueryClient();
    return useMutation<BaseResponse<null>, BaseResponse<ErrorResponse>, string>({
        mutationFn: shopApiEndpoints.deleteProductById,
        onSuccess: (response) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_PRODUCTS],
            });
        },
        onError: (error) => {
            console.error('Validation error:', error);
        }
    });
};