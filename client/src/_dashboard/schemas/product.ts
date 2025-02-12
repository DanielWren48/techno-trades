import { ProductImage } from "@/types";
import * as z from "zod";

export const newProductSchema = z.object({
    name: z.string().min(1, { message: "This field is required" }).max(1000, { message: "Maximum 1000 characters." }),
    image: z.custom<ProductImage[]>(),
    brand: z.string().min(1, { message: "This field is required" }).max(1000, { message: "Maximum 1000 characters." }),
    category: z.enum(["smartphones", "cameras", "computers", "televisions", "consoles", "audio", "mouse", "keyboard"]),
    description: z.string().max(5000, { message: "Maximum 5000 characters for the description" }),
    price: z.coerce.number().min(0, { message: "Price must be a non-negative number" }),
    countInStock: z.coerce.number().min(0, { message: "Stock must be a non-negative number" }),
    discountedPrice: z.coerce.number().min(0).optional(),
    isDiscounted: z.boolean(),
});

export type NewProductSchemaType = z.infer<typeof newProductSchema>