import { Product, ProductCategory } from "@/types";

export interface ProductQueryParams {
    name?: string;
    limit?: number;
    page?: string;
}

export interface ProductFilterBody {
    hideOutOfStock?: boolean;
    discounted?: boolean;
    prices?: {
        min: number;
        max: number;
    };
    brands?: string[];
    categories?: ProductCategory[];
    ratings?: number;
    name?: string;
}

export interface BaseShopResponse<T> {
    status: 'success' | 'failure';
    message: string;
    code?: string;
    data?: T;
}

export interface AllProductsResponse {
    items?: Product[] | undefined;
    page: number;
    itemsCount: number;
    totalPages: number;
    itemsPerPage: number;
}