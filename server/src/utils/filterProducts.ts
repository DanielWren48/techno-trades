import { PipelineStage } from "mongoose";
import { Product } from "../models/products";

interface ProductFilterBody {
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
    sortPrice?: 'asc' | 'desc';
    sort?: string;
}

const hasActiveFilters = (filters: Partial<ProductFilterBody> | undefined): boolean => {
    if (!filters) return false;

    return Boolean(
        filters.hideOutOfStock ||
        filters.discounted ||
        filters.name ||
        (filters.prices?.min || filters.prices?.max) ||
        (filters.categories && filters.categories.length > 0) ||
        (filters.brands && filters.brands.length > 0) ||
        filters.ratings ||
        filters.sortPrice ||
        filters.sort
    );
};

// Now update the getFilteredProducts function to handle the sort parameter
export const getFilteredProducts = async (filters: ProductFilterBody | undefined) => {
    try {
        // If no active filters, return all products with base stages
        if (!hasActiveFilters(filters)) {
            return await Product.aggregate([
                { $sort: { createdAt: -1 } },
                {
                    $addFields: {
                        reviewsCount: { $size: { $ifNull: ['$reviews', []] } },
                        avgRating: {
                            $cond: {
                                if: { $gt: [{ $size: { $ifNull: ['$reviews', []] } }, 0] },
                                then: { $avg: '$reviews.rating' },
                                else: 0,
                            },
                        },
                    }
                },
                {
                    $project: {
                        reviews: 0,
                        description: 0,
                        user: 0,
                        stock: 0,
                        createdAt: 0,
                        updatedAt: 0,
                        slug: 0,
                        __v: 0,
                    }
                }
            ]);
        }

        // Calculate reviewsCount and avgRating first
        const calculateFieldsStage = {
            $addFields: {
                reviewsCount: { $size: { $ifNull: ['$reviews', []] } },
                avgRating: {
                    $cond: {
                        if: { $gt: [{ $size: { $ifNull: ['$reviews', []] } }, 0] },
                        then: { $avg: '$reviews.rating' },
                        else: 0,
                    },
                },
            }
        } as PipelineStage.AddFields;

        // Format avgRating to 1 decimal place
        const formatRatingStage = {
            $addFields: {
                avgRating: {
                    $round: ["$avgRating", 1]
                }
            }
        } as PipelineStage.AddFields;

        // Then apply the filters
        const matchStage = {
            $match: {
                $and: [
                    // Text search
                    filters?.name
                        ? { name: { $regex: filters.name, $options: 'i' } }
                        : {},

                    // Categories filter
                    filters?.categories && filters.categories.length > 0
                        ? { category: { $in: filters.categories } }
                        : {},

                    // Brands filter
                    filters?.brands && filters.brands.length > 0
                        ? { brand: { $in: filters.brands } }
                        : {},

                    // Stock filter
                    filters?.hideOutOfStock
                        ? { stock: { $gt: 0 } }
                        : {},

                    // Stock filter
                    filters?.discounted
                        ? { isDiscounted: true }
                        : {},

                    // Price range filter
                    filters?.prices
                        ? {
                            $or: [
                                {
                                    price: {
                                        $gte: filters.prices.min,
                                        $lte: filters.prices.max
                                    }
                                },
                                {
                                    isDiscounted: true,
                                    discountedPrice: {
                                        $gte: filters.prices.min,
                                        $lte: filters.prices.max
                                    }
                                }
                            ]
                        }
                        : {},

                    // Rating filter - now this will work as avgRating is already calculated
                    filters?.ratings
                        ? { avgRating: { $gte: filters.ratings } }
                        : {},
                ].filter(filter => Object.keys(filter).length > 0) // Remove empty filters
            }
        } as PipelineStage.Match;

        // Determine sort options based on sort parameter
        let sortOptions: Record<string, number> = { createdAt: -1 }; // Default sort

        if (filters?.sort) {
            switch (filters.sort) {
                case 'relevance':
                    // Default sort by createdAt (newest first)
                    sortOptions = { createdAt: -1 };
                    break;
                case 'brandAsc':
                    sortOptions = { brand: 1 };
                    break;
                case 'brandDesc':
                    sortOptions = { brand: -1 };
                    break;
                case 'priceAsc':
                    sortOptions = { price: 1 };
                    break;
                case 'priceDesc':
                    sortOptions = { price: -1 };
                    break;
                case 'customerRating':
                    // Sort by avgRating (highest first)
                    sortOptions = { avgRating: -1 };
                    break;
                case 'deals':
                    // First sort by whether it's discounted, then by discount amount
                    sortOptions = {
                        isDiscounted: -1,  // Discounted products first
                        // Optional: sort by discount percentage if needed
                        // discountPercentage: -1 
                    };
                    break;
                default:
                    // Default to newest first
                    sortOptions = { createdAt: -1 };
            }
        } else if (filters?.sortPrice) {
            // Maintain backward compatibility with sortPrice
            sortOptions = { price: filters.sortPrice === 'asc' ? 1 : -1 };
        }

        // Create sort stage with determined sort options
        const sortStage = { $sort: sortOptions };

        // Project stage to exclude reviews
        const projectStage = {
            $project: {
                reviews: 0,
                description: 0,
                user: 0,
                stock: 0,
                createdAt: 0,
                updatedAt: 0,
                __v: 0,
            }
        } as PipelineStage.Project;

        // Add discount percentage calculation for 'deals' sorting
        const discountStage = {
            $addFields: {
                discountPercentage: {
                    $cond: {
                        if: { $eq: ['$isDiscounted', true] },
                        then: {
                            $round: [
                                {
                                    $multiply: [
                                        {
                                            $divide: [
                                                { $subtract: ['$price', '$discountedPrice'] },
                                                '$price'
                                            ]
                                        },
                                        100
                                    ]
                                },
                                0
                            ]
                        },
                        else: "$$REMOVE"
                    }
                }
            }
        } as PipelineStage.AddFields;

        const pipelineStages: PipelineStage[] = [
            calculateFieldsStage,
            formatRatingStage,
            matchStage,
            //@ts-expect-error
            sortStage,
            projectStage,
            discountStage
        ];

        return await Product.aggregate(pipelineStages);
    } catch (err) {
        console.error('Error in getFilteredProducts:', err);
        throw err;
    }
};