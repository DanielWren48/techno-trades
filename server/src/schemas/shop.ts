import { Expose, Transform, Type } from "class-transformer";
import { Example, transformToNumber } from "./utils";
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
    Max,
    Length,
} from 'class-validator';
import { UserSchema } from "./base";
import { IsMongoId } from "../middlewares/error";

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

class SpecificationSchema {
    @Expose()
    @IsString()
    @Length(1, 300)
    @Example("colour")
    @IsNotEmpty({ message: 'Specification key is required' })
    key?: string;

    @Expose()
    @IsString()
    @Length(1, 300)
    @Example("black")
    @IsNotEmpty({ message: 'Specification value is required' })
    value?: string;
}

export class ProductCreateSchema {
    @Expose()
    @Example("Gaming chair")
    @Length(3, 300)
    name?: string;

    @Expose()
    @Example("QWE123")
    @Length(0, 300)
    model?: string;

    @Expose()
    @Example("This product is a waste of money tbh")
    @Length(30, 15000)
    description?: string;

    @Expose()
    @Example(1000)
    @IsNumber()
    @Min(1)
    @Max(100000000000)
    @Transform(transformToNumber)
    price?: number;

    @Expose()
    @IsBoolean()
    isDiscounted?: boolean;

    @Expose()
    @Example(950)
    @IsNumber()
    @Min(0)
    @Max(100000000000)
    @IsOptional()
    @Transform(transformToNumber)
    discountedPrice?: number;

    @Expose()
    @IsNotEmpty()
    @Example("category")
    @IsMongoId({ message: 'Category must be a valid MongoDB ObjectId' })
    category?: string;

    @Expose()
    @IsString()
    @IsNotEmpty({ message: 'Brand is required' })
    brand?: string;

    @Expose()
    @Example(10)
    @IsNumber()
    @Transform(transformToNumber)
    @Min(0)
    @Max(1000000)
    @IsOptional()
    stock?: number;

    @Expose()
    @IsArray()
    @ArrayNotEmpty({ message: 'At least one image is required' })
    @ValidateNested({ each: true })
    @Type(() => ImageSchema)
    image?: ImageSchema[];

    @Expose()
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => SpecificationSchema)
    specifications?: SpecificationSchema[];

    validate() {
        if (this.isDiscounted && (!this.discountedPrice || this.discountedPrice >= this.price!)) {
            throw new Error('Discounted price must be less than the original price when isDiscounted is true');
        }
    }
}

export class ProductUpdateSchema {
    @Expose()
    @Example("Gaming chair")
    @Length(3, 300)
    @IsOptional()
    name?: string;

    @Expose()
    @Example("QWE123")
    @Length(3, 300)
    @IsOptional()
    model?: string;

    @Expose()
    @Example("This product is a waste of money tbh")
    @Length(30, 15000)
    @IsOptional()
    description?: string;

    @Expose()
    @Example(1000)
    @IsOptional()
    @Min(1)
    @Max(100000000000)
    @IsNumber()
    @Transform(transformToNumber)
    price?: number;

    @Expose()
    @Example("category")
    @IsOptional()
    @IsMongoId({ message: 'Category must be a valid MongoDB ObjectId' })
    category?: string;

    @Expose()
    @Example("Logitech")
    @Length(3, 300)
    @IsOptional()
    brand?: string;

    @Expose()
    @Example(10)
    @IsNumber()
    @Transform(transformToNumber)
    @Min(0)
    @Max(1000000)
    @IsOptional()
    stock?: number;

    @Expose()
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ImageSchema)
    image?: ImageSchema[];

    @Expose()
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => SpecificationSchema)
    specifications?: SpecificationSchema[];
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
    stock?: number;

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