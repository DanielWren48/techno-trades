import { ICategory, Product,  ProductImage } from "@/types";
import { SortCategory } from "@/constants/idnex";

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
    categories?: string[];
    ratings?: number;
    name?: string;
    sort?: SortCategory["value"]
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

export interface UpdateProductDiscount {
    id: string;
    isDiscounted: boolean;
    discountedPrice?: number;
}

export interface UpdateProductStock {
    id: string;
    stockChange: number;
}

export interface UpdateProduct {
    id: string;
    name?: string;
    model?: string;
    image?: ProductImage[];
    brand?: string;
    category?: ICategory["_id"];
    description?: string;
    price?: number;
    stock?: number;
    specifications?: Array<{
        key: string;
        value: string;
    }> | null;
}

export interface CreateReview {
    rating: number
    title: string
    comment: string
    slug: string
}

export interface DeleteReview {
    slug: string
    id: string;
}