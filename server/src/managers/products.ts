import mongoose, { PipelineStage, Types } from "mongoose";
import { IProduct, Product } from "../models/products";
import { ErrorCode, RequestError } from "../config/handlers";

const createProductAggregationPipeline = (matchCondition?: Record<string, any>): PipelineStage[] => {
    const baseAggregationStages: PipelineStage[] = [];

    // Optional match stage
    if (matchCondition) {
        baseAggregationStages.push({
            $match: matchCondition
        } as PipelineStage.Match);
    }

    // Add reviewsCount and avgRating
    baseAggregationStages.push({
        $addFields: {
            reviewsCount: { $size: { $ifNull: ['$reviews', []] } },
            avgRating: {
                $cond: {
                    if: { $gt: [{ $size: { $ifNull: ['$reviews', []] } }, 0] },
                    then: { $avg: '$reviews.rating' }, else: 0,
                },
            },
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
    } as PipelineStage.AddFields);

    // Unwind reviews
    baseAggregationStages.push({
        $unwind: {
            path: '$reviews',
            preserveNullAndEmptyArrays: true
        }
    } as PipelineStage.Unwind);

    // Lookup user details for reviews
    baseAggregationStages.push({
        $lookup: {
            from: 'users',
            localField: 'reviews.user',
            foreignField: '_id',
            as: 'reviewUser'
        }
    } as PipelineStage.Lookup);

    // Unwind reviewUser
    baseAggregationStages.push({
        $unwind: {
            path: '$reviewUser',
            preserveNullAndEmptyArrays: true
        }
    } as PipelineStage.Unwind);

    // Add user details to review
    baseAggregationStages.push({
        $addFields: {
            'reviews.userFirstName': '$reviewUser.firstName',
            'reviews.userLastName': '$reviewUser.lastName',
            'reviews.userAvatar': '$reviewUser.avatar'
        }
    } as PipelineStage.AddFields);

    // Group back to original structure
    baseAggregationStages.push({
        $group: {
            _id: '$_id',
            user: { $first: '$user' },
            name: { $first: '$name' },
            slug: { $first: '$slug' },
            description: { $first: '$description' },
            price: { $first: '$price' },
            isDiscounted: { $first: '$isDiscounted' },
            discountedPrice: { $first: '$discountedPrice' },
            discountPercentage: { $first: '$discountPercentage' },
            category: { $first: '$category' },
            brand: { $first: '$brand' },
            countInStock: { $first: '$countInStock' },
            image: { $first: '$image' },
            reviews: { $push: '$reviews' },
            reviewsCount: { $first: '$reviewsCount' },
            avgRating: { $first: '$avgRating' },
            createdAt: { $first: '$createdAt' }
        }
    } as PipelineStage.Group);

    // Populate seller
    baseAggregationStages.push({
        $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
        }
    } as PipelineStage.Lookup);

    baseAggregationStages.push({
        $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true
        }
    } as PipelineStage.Unwind);

    return baseAggregationStages;
};

const getProducts = async () => {
    try {
        const aggregateData = createProductAggregationPipeline();

        // Explicitly type the full pipeline
        const fullAggregationPipeline: PipelineStage[] = [
            ...aggregateData,
            { $sort: { createdAt: -1 } } as PipelineStage.Sort
        ];

        const products = await Product.aggregate(fullAggregationPipeline);
        return products;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

const getProductBySlug = async (slug: string) => {
    try {
        const aggregateData = createProductAggregationPipeline({ slug: slug });
        const products = await Product.aggregate(aggregateData);

        // Return null if no product found, which will trigger the NotFoundError
        return products.length > 0 ? products[0] : null;
    } catch (err) {
        console.error(err);
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

const updateProductStock = async (productId: string, newStock: number): Promise<IProduct> => {
    try {
        const product = await Product.findById(productId);
        if (!product) {
            throw new RequestError("Product not found", 404, ErrorCode.NON_EXISTENT);
        }

        if (newStock < 0) {
            throw new RequestError("Stock cannot be negative", 400, ErrorCode.INVALID_VALUE);
        }

        product.countInStock = newStock;
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

const updateMultipleProductStocks = async (updates: ProductStockUpdate[]): Promise<IProduct[]> => {
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
        const products = await Product.find({ _id: { $in: productIds } }).session(session);

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

export { getProducts, getProductBySlug, updateProductDiscount, updateProductStock, updateMultipleProductStocks }