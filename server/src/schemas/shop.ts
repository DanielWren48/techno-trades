import { Expose, Type } from "class-transformer";
import { Example } from "./utils";
import {
    IsString,
    IsNumber,
    IsBoolean,
    IsNotEmpty,
    Min,
    IsArray,
    ArrayNotEmpty,
    ValidateNested,
    IsOptional,
    ValidateIf,
} from 'class-validator';
import { UserSchema } from "./base";

class ImageSchema {
    @IsString()
    @IsNotEmpty()
    key?: string;

    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsString()
    @IsNotEmpty()
    url?: string;
}

export class ProductCreateSchema {
    @Expose()
    @IsString()
    @IsNotEmpty({ message: 'Name is required' })
    name?: string;

    @Expose()
    @IsString()
    @IsNotEmpty({ message: 'Description is required' })
    description?: string;

    @Expose()
    @IsNumber()
    @Min(0, { message: 'Price must be a positive number' })
    price?: number;

    @Expose()
    @IsBoolean()
    isDiscounted?: boolean;

    @Expose()
    @IsNumber()
    @IsOptional()
    @Min(0, { message: 'Discounted price must be a positive number' })
    discountedPrice?: number;

    @Expose()
    @IsString()
    @IsNotEmpty({ message: 'Category is required' })
    category?: string;

    @Expose()
    @IsString()
    @IsNotEmpty({ message: 'Brand is required' })
    brand?: string;

    @Expose()
    @IsNumber()
    @Min(0, { message: 'Count in stock must be a non-negative number' })
    countInStock?: number;

    @Expose()
    @IsArray()
    @IsOptional()
    @ArrayNotEmpty({ message: 'At least one image is required' })
    @ValidateNested({ each: true })
    @Type(() => ImageSchema)
    image?: ImageSchema[];

    validate() {
        if (this.isDiscounted && (!this.discountedPrice || this.discountedPrice >= this.price!)) {
            throw new Error('Discounted price must be less than the original price when isDiscounted is true');
        }
    }
}

export class ProductUpdateSchema {
    @Expose()
    @IsString()
    @IsNotEmpty({ message: 'Name is required' })
    name?: string;

    @Expose()
    @IsString()
    @IsNotEmpty({ message: 'Description is required' })
    description?: string;

    @Expose()
    @IsNumber()
    @Min(0, { message: 'Price must be a positive number' })
    price?: number;

    @Expose()
    @IsString()
    @IsNotEmpty({ message: 'Category is required' })
    category?: string;

    @Expose()
    @IsString()
    @IsNotEmpty({ message: 'Brand is required' })
    brand?: string;

    @Expose()
    @IsNumber()
    @Min(0, { message: 'Count in stock must be a non-negative number' })
    countInStock?: number;

    @Expose()
    @IsArray()
    @IsOptional()
    @ArrayNotEmpty({ message: 'At least one image is required' })
    @ValidateNested({ each: true })
    @Type(() => ImageSchema)
    image?: ImageSchema[];
}

export class ProductSchema {
    @Expose()
    @Example("Lenovo Laptop")
    name?: string;

    @Expose()
    @Example("lenovo-laptop")
    slug?: string;

    @Expose()
    @Example("This is a description")
    description?: string;

    @Expose()
    @Example(150.00)
    price?: number;

    @Expose()
    @Example(false)
    isDiscounted?: boolean;

    @Expose()
    @Example(100.00)
    discountedPrice?: number;

    @Expose()
    @Example("electronics")
    category?: string;

    @Expose()
    @Example("Lenovo")
    brand?: string;

    @Expose()
    @Example(10)
    countInStock?: number;

    @Expose()
    @IsArray()
    @Type(() => ImageSchema)
    image?: ImageSchema[];

    @Expose()
    @Example(1)
    reviewsCount?: number;

    @Expose()
    @Example(1)
    avgRating?: number;
}

export class ReviewCreateSchema {
    @Expose()
    @IsNumber()
    @IsNotEmpty({ message: 'Rating is required' })
    @Example(3)
    rating?: number;

    @Expose()
    @IsString()
    @Example("This is a review title")
    @IsNotEmpty({ message: 'Title is required' })
    title?: string;

    @Expose()
    @IsString()
    @Example("This is a review comment")
    @IsNotEmpty({ message: 'Comment is required' })
    comment?: string;
}

export class ReviewSchema {
    @Expose()
    user?: UserSchema;

    @Expose()
    @IsNumber()
    @Example(3)
    rating?: number;

    @Expose()
    @Example("This is a review title")
    title?: string;

    @Expose()
    @Example("This is a review comment")
    comment?: string;
}

export class UpdateProductDiscountSchema {
    @Expose()
    @IsBoolean()
    isDiscounted?: boolean;

    @Expose()
    @ValidateIf(o => o.isDiscounted === true)
    @IsNumber()
    @Min(0, { message: 'Discounted price must be a positive number' })
    discountedPrice?: number;

    validate() {
        if (this.isDiscounted && (!this.discountedPrice && this.discountedPrice !== 0)) {
            throw new Error('Discounted price must be provided and be a positive number when isDiscounted is true');
        }
    }
}

export class UpdateProductStockSchema {
    @Expose()
    @IsNumber()
    stockChange?: number;
}

export class DeleteFileByKey {
    @Expose()
    @IsArray()
    @ArrayNotEmpty({ message: 'At least one image key is required' })
    fileKeys?: string[];
}