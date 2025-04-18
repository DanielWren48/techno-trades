import { Stripe } from 'stripe';
import { ObjectId } from 'mongoose';
import { OrderModel, GetCurrUserOrders, GetOrders, UpdateOrderShippingStatusById, GetOrdersBySessionId } from '../models/order';
import asyncHandler from '../middlewares/asyncHandler';
import env from '../config/config';
import { Request, Response } from "express";
import { UpdateMultipleProductsStock } from './productController';

const stripe = new Stripe(env.STRIPE_SECRET_KEY!);

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
    try {
        const orders = await GetOrders()
        if (orders) {
            return res.status(200).json({ "orders": orders });
        } else {
            res.status(404);
            throw new Error("Order not found");
        }
    } catch (error) {
        console.error("Error fetching orders:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export const getOrdersBySessionId = asyncHandler(async (req: Request, res: Response) => {
    const order = await GetOrdersBySessionId(req.params.id)
    if (order) {
        return res.status(200).json({ order });
    } else {
        res.status(404);
        throw new Error("Order not found");
    }
});

export const updateShippingStatus = asyncHandler(async (req: Request, res: Response) => {
    try {
        const { orderId, status } = req.body
        const order = UpdateOrderShippingStatusById(orderId, status);
        return res.status(200).json({ "order": order });;
    } catch (error) {
        console.error("Error fetching orders:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;
        if (!userId) {
            return res.status(400).json({ error: 'User not authenticated' });
        }

        const orders = await GetCurrUserOrders(userId);
        if (orders) {
            return res.status(200).json({ orders });
        } else {
            res.status(404);
            throw new Error('No orders found for the user');
        }
    } catch (error) {
        console.error("Error fetching orders:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

const createOrder = async (customer: any, data: any, payment: Stripe.Response<Stripe.PaymentMethod>) => {

    const items = JSON.parse(customer.metadata.cart);

    const newOrder = new OrderModel({
        //----CUCTOMER
        user: customer.metadata.userId as ObjectId,
        customerEmail: customer.email,
        customerId: customer.id,
        //----ORDER
        orderNumber: generateOrderNumber(),
        paymentIntentId: data.payment_intent,
        products: items.map((item: any) => ({
            product: item.productId as ObjectId,
            quantity: item.quantity,
        })),
        subtotal: data.amount_subtotal,
        total: data.amount_total,
        shippingAddress: data.shipping_details.address,
        shippingCost: data.shipping_cost,
        paymentStatus: data.payment_status,
        //----PAYMENT
        paymentIntentDetails: {
            id: payment.id,
            sessionId: data.id,
            object: payment.object,
            billing_details: {
                address: {
                    line1: payment.billing_details.address?.line1,
                    line2: payment.billing_details.address?.line2,
                    city: payment.billing_details.address?.city,
                    postal_code: payment.billing_details.address?.postal_code,
                    state: payment.billing_details.address?.state,
                    country: payment.billing_details.address?.country,
                },
                email: payment.billing_details.email,
                name: payment.billing_details.name,
                phone: payment.billing_details.phone,
            },
            card: {
                brand: payment.card?.brand,
                country: payment.card?.country,
                exp_month: payment.card?.exp_month,
                exp_year: payment.card?.exp_year,
                last4: payment.card?.last4,
            },
            metadata: payment.metadata,
            type: payment.type,
        }
    });

    try {
        const savedOrder = await newOrder.save();
        console.log("Order Created");

        const productUpdates = items.map(({ productId, quantity }: { productId: string, quantity: number }) => ({
            id: productId,
            quantity,
        }));
        await UpdateMultipleProductsStock(productUpdates);

        return savedOrder;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

function generateOrderNumber(): string {
    const prefix = "TECHNOTRADES";
    const randomDigits = Math.floor(Math.random() * 100000000);
    const orderNumber = `${prefix}${randomDigits.toString().padStart(8, '0')}`;
    return orderNumber;
}

export const handleStripeEvent = async (event: Stripe.Event) => {
    const eventType = event.type;
    // let data = event.data.object;
    const intent: any = event.data.object
    let response;

    switch (eventType) {
        case 'checkout.session.completed':
            //------------INTEENT------------------
            const paymentIntentId: string = intent.payment_intent;
            const paymentIntent = intent as Stripe.PaymentIntent;
            //------------CUSTOMER------------------
            const customerId: string = paymentIntent.customer as string;
            const customer = await stripe.customers.retrieve(customerId);
            //------------PAYMENT------------------
            const charges = await stripe.charges.list({ payment_intent: paymentIntentId });
            const paymentMethodId = charges.data[0]?.payment_method;
            const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId!);

            console.log({ customer, paymentIntent, paymentMethod });
            const order = await createOrder(customer, paymentIntent, paymentMethod);
            response = { success: true, order };

            break;
        case 'payment_intent.succeeded':
            // Handle successful payment
            response = { success: true, message: 'Payment succeeded' };
            break;

        case 'payment_intent.payment_failed':
            // Handle payment failure
            response = { success: false, message: 'Payment failed' };
            break;

        default:
            response = { success: false, message: 'Unhandled event type' };
    }

    return response;
};