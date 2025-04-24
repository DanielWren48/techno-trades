export type ICategory = {
    _id: string;
    name: string;
    slug: string;
    icon: string;
    image: string;
    parent?: ICategory["_id"] | ICategory | null;
    productCount?: number
    createdAt: string;
    updatedAt: string;
}

export type CreateCategory = {
    name: string;
    icon: string;
    image: string;
    parent?: ICategory["_id"] | ICategory;
}

export type UpdateCategory = {
    id: ICategory["_id"];
    name?: string;
    icon?: string;
    image?: string;
    parent?: ICategory["_id"] | ICategory;
}
