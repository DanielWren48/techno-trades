import { ShippingAddressFormSchema } from "@/_root/components/addressForm";
import { Icons } from "@/components/shared";

//-------------USER TYPES----------------------------------
export enum AUTH_TYPE {
    PASSWORD = "Password",
    GOOGLE = "Google",
}

export enum ACCOUNT_TYPE {
    BUYER = "Buyer",
    STAFF = "Staff",
}

export interface IUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string | undefined;
    isActive: boolean;
    isEmailVerified: boolean;
    authType: AUTH_TYPE;
    accountType: ACCOUNT_TYPE;
    shippingAddress?: [ShippingAddressFormSchema] | undefined
    createdAt?: Date;
    updatedAt?: Date;
}

//-------------PRODUCT TYPES----------------------------------

export type Review = {
    _id: string;
    title: string;
    rating: number;
    comment: string;
    user: IUser;
    userFirstName: string;
    userLastName: string;
    userAvatar: string;
    createdAt: string;
    updatedAt: string;
};

export type INewReview = {
    review: {
        user: IUser;
        title: string;
        comment: string;
        rating: number;
    },
    slug: string
};

export type ProductImage = {
    _id?: string;
    key: string;
    name: string;
    url: string;
};

export type ICategory = {
    _id: string;
    name: string;
    slug: string;
    icon: string;
    desc: string;
    image: string;
    parent?: ICategory["_id"] | ICategory | null;
    subcategories?: ICategory[]
    productCount?: number
    display: {
        title: string,
        subtitle: string,
        image: string,
        colour: string,
    }
    createdAt: string;
    updatedAt: string;
}

export type Product = {
    _id: string;
    user: IUser;
    name: string;
    model: string;
    slug: string;
    description: string;
    price: number;
    isDiscounted: boolean;
    discountedPrice?: number;
    discountPercentage?: number;
    category: ICategory;
    brand: string;
    stock: number;
    image: ProductImage[];
    specifications: Array<{
        key: string;
        value: string;
    }> | null;
    reviews?: Review[];
    reviewsCount: number;
    avgRating: number;
    createdAt: string;
};

export type FilterdProduct = {
    _id?: string;
    name: string;
    model: string;
    price: number;
    isDiscounted: boolean;
    category: ICategory;
    brand: string;
    image: ProductImage[];
    specifications: Array<{
        key: string;
        value: string;
    }> | null;
    slug: string;
    discountedPrice?: number;
    discountPercentage?: number;
    reviewsCount: number;
    avgRating: number;
};

export type INewProduct = {
    userId: string;
    name: string;
    model: string;
    image: ProductImage[];
    brand: string;
    category: ICategory["_id"];
    description: string;
    price: number;
    stock: number;
    isDiscounted: boolean;
    discountedPrice?: number;
};

export type IUpdateProduct = {
    _id?: string;
    userId: string;
    name: string;
    model: string;
    image: ProductImage[];
    brand: string;
    category: ICategory;
    description: string;
    price: number;
    stock: number;
};

//-------------NAV TYPES----------------------------------
export interface NavItem {
    title: string
    href?: string
    disabled?: boolean
    external?: boolean
}

export type SidebarNavItem = {
    title: string
    for: "all" | "admin"
    label: string,
    variant: "default" | "ghost"
    disabled?: boolean
    external?: boolean
    icon?: keyof typeof Icons
} & (
        | {
            href: string
            items?: never
        }
        | {
            href?: string
            items: NavItem[]
        }
    )

export type DashboardConfig = {
    mainNav: NavItem[]
    sidebarNav: SidebarNavItem[]
}