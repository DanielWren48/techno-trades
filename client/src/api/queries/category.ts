import { categoryApiEndpoints, BaseResponse, ErrorResponse } from '../client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CreateCategory, ICategory, UpdateCategory } from '../types/category';

enum QUERY_KEYS {
    GET_CATEGORIES = "getCategories",
    GET_CATEGORY_BY_ID = "getCategoryById",
    GET_CATEGORY_BY_SLUG = "getCategoryBySlug",
}

export const useGetCategories = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_CATEGORIES],
        queryFn: () => categoryApiEndpoints.getAllCategories(),
        // staleTime: Infinity
    });
};

export const useGetCategoryById = (id: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_CATEGORY_BY_ID, id],
        queryFn: () => categoryApiEndpoints.getCategoryById(id),
        enabled: !!id,
    });
};

export const useGetCategoyBySlug = (slug: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_CATEGORY_BY_SLUG, slug],
        queryFn: () => categoryApiEndpoints.getCategoryBySlug(slug),
        enabled: !!slug,
    });
};

export const useCreateNewCategory = () => {
    const queryClient = useQueryClient();
    return useMutation<BaseResponse<ICategory>, BaseResponse<ErrorResponse>, CreateCategory>({
        mutationFn: categoryApiEndpoints.createCategory,
        onSuccess: (response) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CATEGORIES],
            });
        },
        onError: (error) => {
            console.error('Validation error:', error);
        }
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();
    return useMutation<BaseResponse<ICategory>, BaseResponse<ErrorResponse>, UpdateCategory>({
        mutationFn: categoryApiEndpoints.updateCategory,
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CATEGORIES],
            });
        },
        onError: (error) => {
            console.error('Validation error:', error);
        }
    });
};

export const useDeleteCategoryById = () => {
    const queryClient = useQueryClient();
    return useMutation<BaseResponse<null>, BaseResponse<ErrorResponse>, string>({
        mutationFn: categoryApiEndpoints.deleteCategoryById,
        onSuccess: (response) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CATEGORIES],
            });
        },
        onError: (error) => {
            console.error('Validation error:', error);
        }
    });
};