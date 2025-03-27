import { NextFunction, Request, Response, Router } from "express";
import { paginateRecords } from "../utils/paginators";
import { CustomResponse } from "../config/utils";
import { getFilteredProducts, getProductBySlug, getProducts, ProductFilterBody, updateProductDiscount, updateProductStock } from "../managers/products";
import { ErrorCode, NotFoundError, RequestError } from "../config/handlers";
import { Product } from "../models/products";
import { authMiddleware } from "../middlewares/auth";
import { validationMiddleware } from "../middlewares/error";
import { ProductCreateSchema, ProductSchema, ProductUpdateSchema, ReviewCreateSchema, ReviewSchema, UpdateProductDiscountSchema, UpdateProductStockSchema } from "../schemas/shop";

const shopRouter = Router();

shopRouter.get('/products', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await getProducts()
        const data = await paginateRecords(req, products)
        const productsData = { ...data }
        return res.status(200).json(CustomResponse.success('Products Fetched Successfully', productsData))
    } catch (error) {
        next(error)
    }
});

shopRouter.post('/products/filter', async (req: Request, res: Response, next: NextFunction) => {
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

shopRouter.get('/products/:slug', async (req: Request, res: Response, next: NextFunction) => {
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

shopRouter.post('/products/:slug', authMiddleware, validationMiddleware(ReviewCreateSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        console.log(user)
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
        return res.status(200).json(CustomResponse.success(`Review ${action} Successfully`, review, ReviewSchema))
    } catch (error) {
        next(error)
    }
});

shopRouter.post('/', authMiddleware, validationMiddleware(ProductCreateSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = req.user
        const { name, description, price, isDiscounted, discountedPrice, category, brand, countInStock, image } = req.body

        // Create a new product
        const newProduct = new Product({
            user: user,
            name: name,
            description: description,
            price: price,
            isDiscounted: isDiscounted,
            discountedPrice: isDiscounted ? discountedPrice : undefined,
            category: category,
            brand: brand,
            countInStock: countInStock,
            image: image
        });

        // Save the product
        await newProduct.save();

        if (!newProduct) {
            throw new RequestError("Error creating product", 400, ErrorCode.SERVER_ERROR)
        }

        return res.status(200).json(CustomResponse.success('Products Created Successfully', newProduct))
    } catch (error) {
        next(error)
    }
});

shopRouter.patch('/products/:id/discount', authMiddleware, validationMiddleware(UpdateProductDiscountSchema), async (req: Request, res: Response, next: NextFunction) => {
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

shopRouter.patch('/products/:id/stock', authMiddleware, validationMiddleware(UpdateProductStockSchema), async (req: Request, res: Response, next: NextFunction) => {
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

shopRouter.patch('/products/:id/update', authMiddleware, validationMiddleware(ProductUpdateSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, description, price, category, brand, countInStock, image } = req.body

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: { name, description, price, category, brand, countInStock, image } },
            { new: true }
        ).lean();

        return res.status(200).json(CustomResponse.success('Products Updated Successfully', updatedProduct))
    } catch (error) {
        next(error)
    }
});

export default shopRouter