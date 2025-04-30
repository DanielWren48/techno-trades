import slugify from 'slugify'
import mongoose, { Schema, Document, Types } from 'mongoose';

interface ICategory extends Document {
    name: string;
    slug: string;
    icon: string;
    image: string;
    desc: string;
    parent?: Types.ObjectId | ICategory | null;
    productCount?: number;
    display?: {
        title: string,
        subtitle: string,
        image: string,
        colour: string,
    }
}

const CategorySchema = new Schema<ICategory>({
    name: { type: String, required: true, unique: true },
    slug: { type: String },
    icon: { type: String },
    image: { type: String, default: null, required: false },
    desc: { type: String },
    parent: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    display: {
        title: { type: String, required: false },
        subtitle: { type: String, required: false },
        image: { type: String, required: false },
        colour: { type: String, required: false },
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            // Remove id and __v & subcategories if it's an empty array
            if (ret.id) delete ret.id;
            if (ret.__v !== undefined) delete ret.__v;
            if (Array.isArray(ret.subcategories) && ret.subcategories.length === 0) {
                delete ret.subcategories;
            }
            return ret;
        }
    },
    toObject: {
        virtuals: true,
        transform: function (doc, ret) {
            if (ret.id) delete ret.id;
            if (ret.__v !== undefined) delete ret.__v;
            if (Array.isArray(ret.subcategories) && ret.subcategories.length === 0) {
                delete ret.subcategories;
            }
            return ret;
        }
    }
});

CategorySchema.pre('save', async function (next) {
    try {
        if (this.isModified('name') || this.isNew) {
            const newSlug = slugify(this.name, { lower: true, strict: true });
            this.slug = newSlug;
        }
        next();
    } catch (error: any) {
        next(error);
    }
});

CategorySchema.virtual('productCount', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'category',
    count: true
});

CategorySchema.virtual('subcategories', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parent'
});

CategorySchema.methods.getChildren = async function (): Promise<ICategory[]> {
    return await mongoose.model('Category').find({ parent: this._id });
};

const Category = mongoose.model<ICategory>('Category', CategorySchema);

export { ICategory, Category };