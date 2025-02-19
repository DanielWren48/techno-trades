import mongoose, { PipelineStage, Types } from "mongoose";
import { IProduct, Product } from "../models/products";
import { ErrorCode, RequestError } from "../config/handlers";

const getProducts = async () => {
    try {
        const aggregateData: PipelineStage[] = [
            // Add reviewsCount and avgRating
            {
                $addFields: {
                    reviewsCount: { $size: { $ifNull: ['$reviews', []] } },
                    avgRating: {
                        $cond: {
                            if: { $gt: [{ $size: { $ifNull: ['$reviews', []] } }, 0] },
                            then: { $avg: '$reviews.rating' }, else: 0,
                        },
                    },
                },
            },
            // Unwind reviews to be able to lookup user details
            {
                $unwind: {
                    path: '$reviews',
                    preserveNullAndEmptyArrays: true
                }
            },
            // Lookup user details for each review
            {
                $lookup: {
                    from: 'users',
                    localField: 'reviews.user',
                    foreignField: '_id',
                    as: 'reviewUser'
                }
            },
            // Unwind the reviewUser
            {
                $unwind: {
                    path: '$reviewUser',
                    preserveNullAndEmptyArrays: true
                }
            },
            // Add user details to the review
            {
                $addFields: {
                    'reviews.userFirstName': '$reviewUser.firstName',
                    'reviews.userLastName': '$reviewUser.lastName',
                    'reviews.userAvatar': '$reviewUser.avatar'
                }
            },
            // Group back to original structure
            {
                $group: {
                    _id: '$_id',
                    user: { $first: '$user' },
                    name: { $first: '$name' },
                    slug: { $first: '$slug' },
                    description: { $first: '$description' },
                    price: { $first: '$price' },
                    isDiscounted: { $first: '$isDiscounted' },
                    discountedPrice: { $first: '$discountedPrice' },
                    category: { $first: '$category' },
                    brand: { $first: '$brand' },
                    countInStock: { $first: '$countInStock' },
                    image: { $first: '$image' },
                    reviews: { $push: '$reviews' },
                    reviewsCount: { $first: '$reviewsCount' },
                    avgRating: { $first: '$avgRating' },
                    createdAt: { $first: '$createdAt' }
                }
            },
            // Populate the seller
            {
                $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' },
            },
            {
                $unwind: {
                    path: '$user',
                    preserveNullAndEmptyArrays: true, // Allow products without a seller
                },
            },
            // Sort by createdAt descending
            { $sort: { createdAt: -1 } }
        ];
        const products = await Product.aggregate(aggregateData)
        return products;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

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
        filters.sortPrice
    );
};

const getFilteredProducts = async (filters: ProductFilterBody | undefined) => {
    try {
        // If no active filters, return all products with base stages
        if (!hasActiveFilters(filters)) {
            return await Product.aggregate([{ $sort: { createdAt: -1 } }]);
        }

        // If we have filters, add the filter stages
        const filterStages: PipelineStage[] = [
            {
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
                            ? { countInStock: { $gt: 0 } }
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

                        // Rating filter
                        filters?.ratings
                            ? { avgRating: { $gte: filters.ratings } }
                            : {},
                    ].filter(filter => Object.keys(filter).length > 0) // Remove empty filters
                }
            },
            // Sorting
            {
                $sort: filters?.sortPrice
                    ? { price: filters.sortPrice === 'asc' ? 1 : -1 }
                    : { createdAt: -1 }
            }
        ];

        return await Product.aggregate([...filterStages]);
    } catch (err) {
        console.error('Error in getFilteredProducts:', err);
        throw err;
    }
};

const updateProductDiscount = async (
    productId: string,
    discountData: {
        isDiscounted: boolean;
        discountedPrice?: number;
    }
): Promise<IProduct> => {
    try {
        // Find the product and verify ownership
        const product = await Product.findById(productId);

        if (!product) {
            throw new RequestError("Product not found", 404, ErrorCode.NON_EXISTENT);
        }

        // If discount is being set to true, validate discounted price
        if (discountData.isDiscounted) {
            // Ensure discounted price is provided and lower than original price
            if (!discountData.discountedPrice) {
                throw new RequestError("Discounted price is required when isDiscounted is true", 400, ErrorCode.INVALID_VALUE);
            }

            if (discountData.discountedPrice >= product.price) {
                throw new RequestError("Discounted price must be lower than original price", 400, ErrorCode.INVALID_VALUE);
            }
        }

        // Update the product
        product.isDiscounted = discountData.isDiscounted;

        // If discount is true, set discounted price
        // If discount is false, remove discounted price
        product.discountedPrice = discountData.isDiscounted
            ? discountData.discountedPrice
            : undefined;

        // Save the updated product
        await product.save();

        return product;
    } catch (err) {
        console.error(err);
        throw err;
    }
}

const updateProductStock = async (productId: string, stockChange: number): Promise<IProduct> => {
    try {
        const product = await Product.findById(productId);
        if (!product) {
            throw new RequestError("Product not found", 404, ErrorCode.NON_EXISTENT);
        }

        const newStockCount = product.countInStock + stockChange;
        if (newStockCount < 0) {
            throw new RequestError("Stock cannot be negative", 400, ErrorCode.INVALID_VALUE);
        }

        product.countInStock = newStockCount;
        await product.save();
        return product;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

interface ProductStockUpdate {
    productId: string | Types.ObjectId;
    stockChange: number;
}

const updateMultipleProductStocks = async (updates: ProductStockUpdate[], userId: string): Promise<IProduct[]> => {
    const session = await mongoose.startSession();

    try {
        // Begin transaction
        session.startTransaction();

        // Validate input
        if (!updates || updates.length === 0) {
            throw new RequestError("No stock updates provided", 400, ErrorCode.INVALID_VALUE);
        }

        // Collect product IDs to fetch in one query
        const productIds = updates.map(update => new mongoose.Types.ObjectId(update.productId));

        // Fetch all products in one query
        const products = await Product.find({ _id: { $in: productIds }, user: userId }).session(session);

        // Create a map for quick product lookup
        const productMap = new Map(products.map(p => [p._id.toString(), p]));

        // Perform updates
        const updatedProducts: IProduct[] = [];

        for (const update of updates) {
            const product = productMap.get(update.productId.toString());

            if (!product) {
                throw new RequestError(`Product with ID ${update.productId} not found or not owned by user`, 404, ErrorCode.NON_EXISTENT);
            }

            // Calculate new stock count
            const newStockCount = product.countInStock + update.stockChange;

            // Prevent negative stock
            if (newStockCount < 0) {
                throw new RequestError(`Stock for product ${product.name} cannot go negative`, 400, ErrorCode.INVALID_VALUE);
            }

            // Update stock
            product.countInStock = newStockCount;

            // Save the product
            await product.save({ session });

            updatedProducts.push(product);
        }

        // Commit transaction
        await session.commitTransaction();

        return updatedProducts;
    } catch (error: any) {
        // Abort transaction in case of error
        await session.abortTransaction();
        throw error;
    } finally {
        // End the session
        session.endSession();
    }
};

export { getProducts, updateProductDiscount, updateProductStock, updateMultipleProductStocks, getFilteredProducts, ProductFilterBody }