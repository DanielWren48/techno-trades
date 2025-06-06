import { NextFunction, Request, Response, Router } from "express";
import { paginateRecords } from "../utils/paginators";
import { CustomResponse } from "../config/utils";
import { getProductBySlug, getProducts, updateProductDiscount, updateProductStock } from "../managers/products";
import { ErrorCode, NotFoundError, RequestError } from "../config/handlers";
import { Product } from "../models/products";
import { authMiddleware, staff } from "../middlewares/auth";
import { validationMiddleware } from "../middlewares/error";
import { rateLimiter, RATE_CFG, rateLimiterSimple } from "../middlewares/rate_limitor";
import { ProductCreateSchema, ProductSchema, ProductUpdateSchema, ReviewCreateSchema, ReviewSchema, UpdateProductDiscountSchema, UpdateProductStockSchema } from "../schemas/shop";
import { getFilteredProducts } from "../utils/filterProducts";
import { utapi } from "../upload";
import { Category } from "../models/category";

const shopRouter = Router();

shopRouter.get('/products', rateLimiter(RATE_CFG.routes.getProducts), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await getProducts()
        const data = await paginateRecords(req, products)
        const productsData = { ...data }
        return res.status(200).json(CustomResponse.success('Products Fetched Successfully', productsData))
    } catch (error) {
        next(error)
    }
});

shopRouter.post('/products/filter', rateLimiter(RATE_CFG.routes.getProducts), async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Handle empty body or undefined filters
        const filters = Object.keys(req.body).length > 0 ? req.body : undefined;
        const products = await getFilteredProducts(filters);
        const data = await paginateRecords(req, products);
        return res.status(200).json(CustomResponse.success('Products Fetched Successfully', data))
    } catch (error) {
        next(error);
    }
});

shopRouter.get('/products/:slug', rateLimiter(RATE_CFG.routes.getProducts), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const product = await getProductBySlug(req.params.slug)
        if (!product) {
            throw new NotFoundError("Product does not exist!")
        }
        return res.status(200).json(CustomResponse.success('Product Details Fetched Successfully', product))
    } catch (error) {
        next(error)
    }
});

shopRouter.post('/products/:slug', rateLimiter(RATE_CFG.routes.setProducts), authMiddleware, staff, validationMiddleware(ReviewCreateSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        const product = await Product.findOne({ slug: req.params.slug })
        if (!product) {
            throw new NotFoundError("Product does not exist!")
        }

        const { rating, title, comment } = req.body

        let review = product.reviews.find((review: any) => review.user === user._id)
        let action = "Added"
        if (review) {
            review.title = title
            review.comment = comment
            review.rating = rating
            action = "Updated"
        } else {
            product.reviews.push({ user: user._id, title, comment, rating })
        }
        await product.save()
        review = { user, title, comment, rating }
        let slug = product.slug
        return res.status(200).json(CustomResponse.success(`Review ${action} Successfully`, { review, slug }))
    } catch (error) {
        next(error)
    }
});

shopRouter.delete('/products/:slug/reviews/:id/delete', rateLimiter(RATE_CFG.default), authMiddleware, staff, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        const { slug: productSlug, id: reviewId } = req.params

        const updatedProduct = await Product.findOneAndUpdate(
            { slug: productSlug },
            { $pull: { reviews: { _id: reviewId } } },
            { new: true }
        );

        if (!updatedProduct) {
            throw new NotFoundError("Product review does not exist!")
        }
        return res.status(200).json(CustomResponse.success('Review Deleted Successfully'))
    } catch (error) {
        next(error)
    }
});

shopRouter.post('/', rateLimiter(RATE_CFG.routes.setProducts), authMiddleware, staff, validationMiddleware(ProductCreateSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        const { name, model, description, price, isDiscounted, discountedPrice, category, brand, stock, image, specifications } = req.body;

        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            throw new RequestError("Invalid category ID", 400, ErrorCode.INVALID_VALUE);
        }

        // Create a new product
        const newProduct = new Product({
            user: user,
            name,
            model,
            description,
            price,
            isDiscounted,
            discountedPrice: isDiscounted ? discountedPrice : undefined,
            category,
            brand,
            stock,
            image,
            specifications
        });

        // Save the product
        await newProduct.save();

        if (!newProduct) {
            throw new RequestError("Error creating product", 400, ErrorCode.SERVER_ERROR)
        }

        const populatedProduct = await Product.findById(newProduct._id).populate('category');

        return res.status(200).json(CustomResponse.success('Products Created Successfully', populatedProduct || newProduct));
    } catch (error) {
        next(error)
    }
});

shopRouter.patch('/products/:id/discount', rateLimiter(RATE_CFG.routes.setProducts), authMiddleware, staff, validationMiddleware(UpdateProductDiscountSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        const { id } = req.params;
        const { isDiscounted, discountedPrice } = req.body;

        const updatedProduct = await updateProductDiscount(
            id, { isDiscounted, discountedPrice }
        );

        return res.status(200).json(CustomResponse.success(
            isDiscounted
                ? 'Product discount applied successfully'
                : 'Product discount removed successfully',
            updatedProduct
        ));

    } catch (error) {
        next(error)
    }
});

shopRouter.patch('/products/:id/stock', rateLimiter(RATE_CFG.routes.setProducts), authMiddleware, staff, validationMiddleware(UpdateProductStockSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { stockChange } = req.body;

        const updatedProduct = await updateProductStock(id, stockChange);
        return res.status(200).json(CustomResponse.success('Product stock updated successfully', updatedProduct));
    } catch (error) {
        next(error);
    }
});

shopRouter.patch('/products/:id/update', rateLimiter(RATE_CFG.routes.setProducts), authMiddleware, staff, validationMiddleware(ProductUpdateSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, model, description, price, category, brand, stock, image, specifications } = req.body

        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            throw new RequestError("Invalid category ID", 400, ErrorCode.INVALID_VALUE);
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: { name, model, description, price, category, brand, stock, image, specifications, isDiscounted: false } },
            { new: true, populate: { path: 'category' }, lean: true }
        )

        return res.status(200).json(CustomResponse.success('Products Updated Successfully', updatedProduct))
    } catch (error) {
        next(error)
    }
});

shopRouter.delete('/products/:id/delete', rateLimiter(RATE_CFG.routes.setProducts), authMiddleware, staff, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);
        if (!product) {
            throw new NotFoundError('Product does not exist!');
        }

        const imageKeys = product.image.map(img => img.key);
        if (imageKeys.length) {
            const { success } = await utapi.deleteFiles(imageKeys);
            if (success) {
                await Product.findByIdAndDelete(id)
                return res.status(200).json(CustomResponse.success('Products Deleted Successfully'))
            }
            return res.status(500).json(CustomResponse.error('Error Deleting Product', ErrorCode.SERVER_ERROR));
        }
        await Product.findByIdAndDelete(id)
        return res.status(200).json(CustomResponse.success('Products Deleted Successfully'))

    } catch (error) {
        next(error)
    }
});

export default shopRouter