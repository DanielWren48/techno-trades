import { Document, Model, PopulatedDoc, Schema, Types, model } from 'mongoose';
import { IProduct } from './products';

interface OrderProduct {
    product: Types.ObjectId;
    quantity: number;
}

interface OrderShippingAddress {
    city: string;
    country: string;
    line1: string;
    line2: string | null;
    postal_code: string;
    state: string;
}

interface OrderShippingCost {
    amount_subtotal: number;
    amount_tax: number;
    amount_total: number;
    shipping_rate: string;
}

interface PaymentIntentDetails {
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

interface Order {
    user: Types.ObjectId;
    customerId: string;
    customerEmail: string;
    paymentIntentId: string;
    paymentIntentDetails: PaymentIntentDetails;
    products: OrderProduct[];
    subtotal: number;
    total: number;
    shippingAddress: OrderShippingAddress;
    shippingCost: OrderShippingCost;
    deliveryStatus: string;
    paymentStatus: string;
    orderNumber: string;
}

export interface IOrder extends Order, Document {
    products: Array<{
        product: PopulatedDoc<IProduct & Document>;
        quantity: number;
    }>;
}

const OrderSchema = new Schema<IOrder>({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    customerId: { type: String, required: true },
    customerEmail: { type: String, required: true },
    paymentIntentId: { type: String, required: true },
    paymentIntentDetails: { type: Object, required: true },
    products: [
        {
            product: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: 'ProductModel',
            },
            quantity: { type: Number, required: true },
        },
    ],
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    shippingAddress: { type: Object, required: true },
    shippingCost: {
        amount_subtotal: { type: Number },
        amount_tax: { type: Number },
        amount_total: { type: Number },
        shipping_rate: { type: String },
    },
    deliveryStatus: { type: String, default: "pending" },
    paymentStatus: { type: String, required: true },
    orderNumber: { type: String, required: true, unique: true },
}, {
    timestamps: true
})

export const Order = model<IOrder>('Order', OrderSchema);

export const GetOrders = () => Order.find().populate({
    path: 'user',
    model: 'User',
});

export const GetOrderById = (id: any) => Order.findById({ id })

export const GetOrdersBySessionId = (sessionId: string) => Order.findOne({
    'paymentIntentDetails.sessionId': sessionId
}).populate({
    path: 'user',
    model: 'User',
}).populate({
    path: 'products.product',
    model: 'Product',
});

export const GetCurrUserOrders = async function (userId: Types.ObjectId) {
    try {
        const orders = await Order.find({ user: userId }).populate({
            path: 'products.product',
            model: 'Product',
        })
        return orders;
    } catch (error) {
        console.error('Error fetching user orders:', error);
        throw new Error('Internal server error');
    }
};

export const UpdateOrderShippingStatusById = async (orderId: string, status: string) => {
    try {
        return await Order.findByIdAndUpdate(
            orderId,
            { $set: { deliveryStatus: status } },
            { new: true }
        ).lean();

    } catch (error) {
        console.error("Error updating order shipping status:", error);
        throw error;
    }
};