import { Expose } from 'class-transformer';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsBoolean,
    MaxLength,
} from 'class-validator';
import { IsMongoId } from '../middlewares/error';

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
    @IsOptional()
    image?: string;

    @Expose()
    @IsMongoId({ message: 'Parent category must be a valid MongoDB ObjectId' })
    @IsOptional()
    parent?: string;
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
    @IsMongoId({ message: 'Parent category must be a valid MongoDB ObjectId' })
    @IsOptional()
    parent?: string;

    // Ensure at least one field is provided for update
    validate() {
        const updateFields = ['name', 'icon', 'image', 'parent'];
        const hasUpdate = updateFields.some(field => this[field as keyof CategoryUpdateSchema] !== undefined);

        if (!hasUpdate) {
            throw new Error('At least one field must be provided for update');
        }
    }
}