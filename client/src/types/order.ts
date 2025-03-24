import { IUser, Product } from ".";

//----------------------------------------ORDER TYPE--------------------------------------------
type OrderProduct = {
    product: Product;
    quantity: number;
    _id: string;
}

type OrderShippingAddress = {
    address: {
        city: string;
        country: string;
        line1: string;
        line2: string | null;
        postal_code: string;
        state: string;
    },
}

export type PaymentMethodDetails = {
    id: string;
    sessionId: string;
    object: string;
    billing_details: {
        address: {
            city: string;
            country: string;
            line1: string;
            line2: string | null;
            postal_code: string;
            state: string | null;
        };
        email: string;
        name: string;
        phone: string | null;
    };
    card: {
        brand: string;
        country: string;
        exp_month: number;
        exp_year: number;
        last4: string;
    };
    metadata: Record<string, any>;
    type: string;
}

export type Order = {
    _id: string;
    userId: string;
    user: IUser;
    customerId: string;
    customerEmail: string;
    paymentIntentId: string;
    paymentIntentDetails: PaymentMethodDetails;
    products: OrderProduct[];
    subtotal: number;
    total: number;
    shippingAddress: OrderShippingAddress;
    shippingCost: {
        amount_subtotal: number;
        amount_tax: number;
        amount_total: number;
        shipping_rate: string;
    };
    orderNumber: string;
    deliveryStatus: "pending" | "shipped" | "delivered";
    paymentStatus: "succeeded" | "failed";
    createdAt: Date;
}