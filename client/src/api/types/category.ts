import { ICategory } from "@/types";

export type CreateCategory = {
    name: string;
    icon: string;
    image: string;
    parent?: ICategory["_id"] | null;
}

export type UpdateCategory = {
    id: ICategory["_id"];
    name?: string;
    icon?: string;
    image?: string;
    parent?: ICategory["_id"] | ICategory;
}
