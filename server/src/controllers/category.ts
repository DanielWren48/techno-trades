import { Request, Response, NextFunction, Router } from "express";
import { CustomResponse } from "../config/utils";
import { ErrorCode, NotFoundError, RequestError } from "../config/handlers";
import { Category } from "../models/category";
import { Product } from "../models/products";
import { validationMiddleware } from "../middlewares/error";
import { CategoryCreateSchema, CategoryUpdateSchema } from "../schemas/category";
import { authMiddleware, staff } from "middlewares/auth";
import { RATE_CFG, rateLimiter } from "middlewares/rate_limitor";

const categoryRouter = Router();

categoryRouter.get('', rateLimiter(RATE_CFG.default), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parentCategories = await Category.find({ parent: null })
            .populate({
                path: 'subcategories',
                populate: {
                    path: 'subcategories'
                }
            }).populate({ path: 'productCount' });

        if (!parentCategories.length) {
            throw new NotFoundError("Categories not found")
        }

        return res.status(200).json(CustomResponse.success("OK", parentCategories))
    } catch (error) {
        next(error)
    }
});

categoryRouter.get('/id/:id', rateLimiter(RATE_CFG.default), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const category = await Category.findById(id)
            .populate({
                path: 'subcategories',
                populate: {
                    path: 'subcategories'
                }
            });

        if (!category) {
            throw new NotFoundError("Category not found")
        }

        return res.status(200).json(CustomResponse.success("OK", category))
    } catch (error) {
        next(error)
    }
});

categoryRouter.get('/slug/:slug', rateLimiter(RATE_CFG.default), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const category = await Category.findOne({ slug: req.params.slug })
            .populate({
                path: 'subcategories',
                populate: {
                    path: 'subcategories'
                }
            });

        if (!category) {
            throw new NotFoundError("Category not found!")
        }

        return res.status(200).json(CustomResponse.success("OK", category))
    } catch (error) {
        next(error)
    }
});

categoryRouter.post('/', rateLimiter(RATE_CFG.default), authMiddleware, staff, validationMiddleware(CategoryCreateSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, icon, desc, image, parent, display } = req.body as CategoryCreateSchema;

        // Check if parent category exists if provided
        if (parent) {
            const parentCategory = await Category.findById(parent);
            if (!parentCategory) {
                throw new RequestError("Parent category not found", 400, ErrorCode.NON_EXISTENT);
            }
        }

        // Check if category with same name already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            throw new RequestError("Category with this name already exists", 400, ErrorCode.INVALID_VALUE);
        }

        // Create a new category
        const newCategory = new Category({
            name,
            icon,
            desc,
            image: image,
            parent: parent || null,
            display,
        });

        const savedCategory = await newCategory.save();
        return res.status(201).json(CustomResponse.success('Category created successfully', savedCategory))
    } catch (error) {
        next(error)
    }
});

categoryRouter.patch('/:id', rateLimiter(RATE_CFG.default), authMiddleware, staff, validationMiddleware(CategoryUpdateSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, icon, image, parent } = req.body;

        // Check if category exists
        const category = await Category.findById(id);
        if (!category) {
            throw new NotFoundError("Category not found!")
        }

        // Check parent category if provided
        if (parent) {
            // Prevent circular references
            if (parent === id) {
                throw new RequestError("Category cannot be its own parent", 400, ErrorCode.INVALID_ENTRY);
            }

            const parentCategory = await Category.findById(parent);
            if (!parentCategory) {
                throw new RequestError("Parent category not found", 400, ErrorCode.INVALID_ENTRY);
            }

            // Check for circular references in the hierarchy
            let currentParent = parentCategory;
            while (currentParent.parent) {
                if (currentParent.parent.toString() === id) {
                    throw new RequestError("Circular reference detected in category hierarchy", 400, ErrorCode.INVALID_DATA_TYPE);
                }
                //@ts-expect-error
                currentParent = await Category.findById(currentParent.parent);
                if (!currentParent) break;
            }
        }

        // Update fields
        if (name) {
            // Check if another category with this name exists
            const existingCategory = await Category.findOne({ name, _id: { $ne: id } });
            if (existingCategory) {
                throw new RequestError("Category with this name already exists", 400, ErrorCode.INVALID_VALUE);
            }

            category.name = name;
        }

        category.icon = icon;
        if (image !== undefined) category.image = image;
        if (parent !== undefined) category.parent = parent;

        // Save the updated category
        await category.save();

        return res.status(200).json(CustomResponse.success('Category Updated Successfully', category));
    } catch (error) {
        next(error)
    }
});

categoryRouter.delete('/:id', rateLimiter(RATE_CFG.default), authMiddleware, staff, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const childCategories = await Category.find({ parent: id });
        if (childCategories.length > 0) {
            return res.status(400).json(CustomResponse.error('Cannot delete category with child categories. Please delete or reassign child categories first.', ErrorCode.NOT_ALLOWED));
        }

        // Check if category is used by any products before deleting
        const productsWithCategory = await Product.find({ category: id });
        if (productsWithCategory.length > 0) {
            return res.status(400).json(CustomResponse.error('Cannot delete category that is used by products. Please reassign products first.', ErrorCode.NOT_ALLOWED));
        }

        const category = await Category.findByIdAndDelete(id);
        if (!category) {
            throw new NotFoundError('Category not found!');
        }

        return res.status(200).json(CustomResponse.success('Category Deleted Successfully'))
    } catch (error) {
        next(error)
    }
});

export default categoryRouter