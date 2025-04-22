export type ICategory = {
    _id: string;
    name: string;
    slug: string;
    icon: string;
    image: string;
    parent?: ICategory["_id"] | ICategory | null;
    createdAt: string;
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
