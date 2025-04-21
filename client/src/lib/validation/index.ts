import { ACCOUNT_TYPE, AUTH_TYPE, ProductImage } from "@/types";
import * as z from "zod";

// ============================================================
// USER
// ============================================================
export const ProfileUpdateValidation = z.object({
    firstName: z.string().min(2, { message: "Must be at least 2 characters." }),
    lastname: z.string().min(2, { message: "Must be at least 2 characters." }),
    email: z.string().email(),
    photo: z.string(),
});

export const UpdateUserEmailValidation = z.object({
    currentEmail: z.string().email(),
    newEmail: z.string().email(),
    pin: z.string().min(6, { message: "Your one-time password must be 6 characters." })
});

export const UpdatePasswordValidation = z.object({
    currentPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
    newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
    newPasswordConfirm: z.string().min(8, { message: "Password must be at least 8 characters." })
}).refine((data) => {
    return data.newPassword === data.newPasswordConfirm;
}, {
    message: "Password do not match",
    path: ["newPasswordConfirm"]
});

// ============================================================
// PRODUCTS & PRODUCTS TABLE
// ============================================================
export const ProductCreateValidation = z.object({
    name: z.string().min(1, { message: "This field is required" }).max(1000, { message: "Maximum 1000 characters." }),
    image: z.custom<ProductImage[]>(),
    brand: z.string().min(1, { message: "This field is required" }).max(1000, { message: "Maximum 1000 characters." }),
    category: z.enum(["smartphones", "cameras", "computers", "televisions", "consoles", "audio", "mouse", "keyboard"]),
    description: z.string().max(5000, { message: "Maximum 5000 characters for the description" }),
    price: z.coerce.number().min(0, { message: "Price must be a non-negative number" }),
    countInStock: z.coerce.number().min(0, { message: "Stock must be a non-negative number" }),
    discountedPrice: z.coerce.number().min(1).max(99).optional().or(z.literal(0)),
    isDiscounted: z.boolean(),
});

const specificationSchema = z.object({
    key: z.string().min(1, { message: 'Key is required' }),
    value: z.string().min(1, { message: 'Value is required' }),
});

export const productTableSchema = z.object({
    _id: z.string().optional(),
    name: z.string().min(1, { message: "This field is required" }).max(1000, { message: "Maximum 1000 characters." }),
    brand: z.string(),
    image: z.custom<ProductImage[]>(),
    category: z.enum(["smartphones", "cameras", "computers", "televisions", "consoles", "audio", "mouse", "keyboard"]),
    description: z.string().max(15000, { message: "Maximum 5000 characters for the description" }),
    price: z.coerce.number().min(0, { message: "Price must be a non-negative number" }),
    countInStock: z.coerce.number().min(0, { message: "Stock must be a non-negative number" }),
    discountedPrice: z.coerce.number().min(0).optional(),
    discountPercentage: z.coerce.number().min(0).optional(),
    isDiscounted: z.boolean(),
    specifications: z.array(specificationSchema).nullable(),
})

export type ProductType = z.infer<typeof productTableSchema>

// ============================================================
// USERS TABLE
// ============================================================

export const usersTableSchema = z.object({
    _id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    avatar: z.string().optional(),
    authType: z.custom<AUTH_TYPE>(),
    accountType: z.custom<ACCOUNT_TYPE>(),
    // createdAt: z.date().optional(),
    // updatedAt: z.date().optional(),
})
export type UserType = z.infer<typeof usersTableSchema>

// ============================================================
// REVIEWS TABLE
// ============================================================

export const reviewsTableSchema = z.object({
    productId: z.string(),
    productSlug: z.string(),
    _id: z.string(),
    title: z.string(),
    rating: z.number(),
    comment: z.string(),
    userFirstName: z.string(),
    userLastName: z.string(),
    userAvatar: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
})
export type ReviewType = z.infer<typeof reviewsTableSchema>

// ============================================================
// ORDER TABLE
// ============================================================

const cardDetailsSchema = z.object({
    brand: z.string(),
    country: z.string(),
    exp_month: z.number(),
    exp_year: z.number(),
    last4: z.string(),
});

const shippingDetailsSchema = z.object({
    amount_subtotal: z.number(),
    amount_tax: z.number(),
    amount_total: z.number(),
    shipping_rate: z.string(),
});

export const orderTableSchema = z.object({
    _id: z.string(),
    orderNumber: z.string(),
    // user: usersTableSchema,
    customerId: z.string(),
    customerEmail: z.string().email(),
    total: z.number(),
    paymentIntentDetails: z.object({ card: cardDetailsSchema }),
    // shippingCost: shippingDetailsSchema,
    // createdAt: z.date().optional(),
    deliveryStatus: z.enum(["pending", "shipped", "delivered"]),
    paymentStatus: z.enum(["succeeded", "failed"]),
});

export type OrderType = z.infer<typeof orderTableSchema>