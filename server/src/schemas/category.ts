import { Expose, Type } from 'class-transformer';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    MaxLength,
    Length,
    ValidateNested,
    IsHexColor,
} from 'class-validator';
import { IsMongoId } from '../middlewares/error';
import { Example } from './utils';

class DisplaySchema {
    @Expose()
    @IsString()
    @Length(1, 300)
    @Example("Camera equipment")
    @IsNotEmpty({ message: 'Display title is required' })
    title?: string;

    @Expose()
    @IsString()
    @Length(1, 300)
    @Example("blah blah blah")
    @IsNotEmpty({ message: 'Display subtitle is required' })
    subtitle?: string;

    @Expose()
    @IsString()
    @IsNotEmpty({ message: 'Image is required' })
    image?: string;

    @Expose()
    @IsString()
    @Example('#aabbcc')
    @IsHexColor({ message: 'Colour must be a valid hex color (e.g. #aabbcc)' })
    @IsNotEmpty({ message: 'Colour is required' })
    colour?: string;
}

export class CategoryCreateSchema {
    @Expose()
    @IsString()
    @IsNotEmpty({ message: 'Name is required' })
    @MaxLength(100, { message: 'Name must be at most 100 characters' })
    name?: string;

    @Expose()
    @IsString()
    @IsNotEmpty({ message: 'Icon is required' })
    icon?: string;

    @Expose()
    @IsString()
    @IsNotEmpty({ message: 'Image is required' })
    image?: string;

    @Expose()
    @Example("This category has nothing at all interesting, more on...")
    @Length(10, 15000)
    desc?: string;

    @Expose()
    @IsMongoId({ message: 'Parent category must be a valid MongoDB ObjectId' })
    @IsOptional()
    parent?: string;

    @Expose()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => DisplaySchema)
    display?: DisplaySchema;
}

export class CategoryUpdateSchema {
    @Expose()
    @IsString()
    @IsOptional()
    @MaxLength(100, { message: 'Name must be at most 100 characters' })
    name?: string;

    @Expose()
    @IsString()
    @IsOptional()
    icon?: string;

    @Expose()
    @IsString()
    @IsOptional()
    image?: string;

    @Expose()
    @IsString()
    @IsOptional()  
    @Length(10, 15000)
    @Example("This category has nothing at all interesting, more on...")
    desc?: string;

    @Expose()
    @IsMongoId({ message: 'Parent category must be a valid MongoDB ObjectId' })
    @IsOptional()
    parent?: string;

    @Expose()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => DisplaySchema)
    display?: DisplaySchema;

    // Ensure at least one field is provided for update
    validate() {
        const updateFields = ['name', 'icon', 'image', 'desc', 'parent'];
        const hasUpdate = updateFields.some(field => this[field as keyof CategoryUpdateSchema] !== undefined);

        if (!hasUpdate) {
            throw new Error('At least one field must be provided for update');
        }
    }
}