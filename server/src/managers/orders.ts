import { Stripe } from 'stripe';
import { ObjectId } from 'mongoose';
import { Order, ShippingOption } from '../models/order';
import env from '../config/config';
import { updateMultipleProductStocks } from './products';
import { OrderItem } from '../controllers/stripe';

const stripe = new Stripe(env.STRIPE_SECRET_KEY!);

const createOrder = async (customer: any, paymentIntent: Stripe.PaymentIntent, payment: Stripe.Response<Stripe.PaymentMethod>) => {

    const cart = JSON.parse(paymentIntent.metadata.cart) as OrderItem[]
    const shipping_option = JSON.parse(paymentIntent.metadata.shipping_option) as ShippingOption
    const amount = paymentIntent.amount
    const amount_total = +paymentIntent.metadata.amount_total * 100

    const newOrder = new Order({
        //----CUCTOMER
        user: customer.metadata.userId,
        customerEmail: customer.email,
        customerId: customer.id,
        //----ORDER
        orderNumber: generateOrderNumber(),
        paymentIntentId: paymentIntent.id,
        products: cart.map((item: OrderItem) => ({
            product: item.productId,
            quantity: item.quantity,
        })),
        subtotal: amount,
        total: amount_total,
        shippingAddress: paymentIntent.shipping,
        paymentStatus: paymentIntent.status,
        //----PAYMENT
        paymentIntentDetails: {
            id: payment.id,
            sessionId: paymentIntent.id,
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
        },
        shippingOption: shipping_option,
    });

    console.log({ newOrder })

    try {
        const savedOrder = await newOrder.save();
        console.log("Order Created");

        const productUpdates = cart.map(({ productId, quantity }) => ({
            productId: productId,
            stockChange: -quantity,
        }));
        await updateMultipleProductStocks(productUpdates)

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
        // case 'checkout.session.completed':
        //     //------------INTEENT------------------
        //     const paymentIntentId: string = intent.payment_intent;
        //     const paymentIntent = intent as Stripe.PaymentIntent;
        //     //------------CUSTOMER------------------
        //     const customerId: string = paymentIntent.customer as string;
        //     const customer = await stripe.customers.retrieve(customerId);
        //     //------------PAYMENT------------------
        //     const charges = await stripe.charges.list({ payment_intent: paymentIntentId });
        //     const paymentMethodId = charges.data[0]?.payment_method;
        //     const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId!);

        //     console.log({ customer, paymentIntent, paymentMethod });
        //     const order = await createOrder(customer, paymentIntent, paymentMethod);
        //     response = { success: true, order };

        //     break;
        case 'payment_intent.succeeded':
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

        case 'payment_intent.payment_failed':
            // Handle payment failure
            response = { success: false, message: 'Payment failed' };
            break;

        default:
            response = { success: false, message: 'Unhandled event type' };
    }

    return response;
};