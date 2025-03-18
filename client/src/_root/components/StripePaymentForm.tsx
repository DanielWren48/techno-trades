import { useState } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
    Elements,
    useStripe,
    useElements,
    PaymentElement,
} from '@stripe/react-stripe-js';
import { Card, CardContent, CardDescription } from "@/components/ui/card"
import { appearance, stripePaymentElementOptions } from '@/constants/idnex';
import { ShippingAddressFormSchema } from './addressForm';
import { IUser } from '@/types';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/shared';
import { Skeleton } from '@/components/ui/skeleton';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PRIVATE_KEY);

const PaymentForm = ({
    user,
    shippingAddress,
    onPaymentSuccess,
    onPaymentError
}: {
    user: IUser,
    shippingAddress: Omit<ShippingAddressFormSchema, "save_address">;
    onPaymentSuccess: (paymentIntent: any) => void,
    onPaymentError: (error: string | undefined) => void
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);

        try {
            const result = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/checkout-success`,
                    payment_method_data: {
                        billing_details: {
                            address: {
                                line1: shippingAddress.line1,
                                line2: shippingAddress.line2,
                                city: shippingAddress.city,
                                state: shippingAddress.state,
                                postal_code: shippingAddress.postal_code,
                                country: shippingAddress.country,
                            },
                            name: [user.firstName, user.lastName].join(" "),
                            email: user.email
                        },
                    },
                },
            });

            if (result.error) {
                onPaymentError(result.error.message);
            } else {
                onPaymentSuccess(result);
            }
        } catch (error) {
            onPaymentError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setIsProcessing(false);
        }
    }

    return (
        <form id="payment-form" onSubmit={handleSubmit} className='w-full max-w-[650px]'>
            <PaymentElement id="payment-element" options={stripePaymentElementOptions} />
            <Button
                type="submit"
                disabled={isProcessing || !stripe}
                className="w-full bg-dark-4 py-7 dark:text-white/90 text-lg mt-10"
                size="lg"
            >
                {isProcessing ?
                    <div className="spinner" id="spinner"></div> :
                    <>
                        <Icons.visa className="w-16 bg-light-2 rounded-md p-1.5 mr-2" />
                        Place order
                    </>
                }
            </Button>
        </form>
    )
}

const FormLoading = () => (
    <Card className="w-full max-w-[650px] shadow-md flex flex-col gap-5 content-center justify-center bg-accent py-16 px-20 cursor-wait">
        <CardContent className='flex flex-col gap-4'>
            <div className='space-y-2'>
                <CardDescription>Card number</CardDescription>
                <Skeleton className=" bg-white h-12 w-full border-2" />
            </div>
            <div className="flex flex-row gap-5">
                <div className='w-full space-y-2'>
                    <CardDescription>Expiration data</CardDescription>
                    <Skeleton className=" bg-white h-12 w-full border-2" />
                </div>
                <div className='w-full space-y-2'>
                    <CardDescription>Security code</CardDescription>
                    <Skeleton className=" bg-white h-12 w-full border-2" />
                </div>
            </div>
        </CardContent>
    </Card>
)

const StripeCheckout = ({
    user,
    loading,
    clientSecret,
    shippingAddress,
    onPaymentSuccess,
    onPaymentError
}: {
    user: IUser,
    loading: boolean,
    clientSecret: string,
    shippingAddress: ShippingAddressFormSchema,
    onPaymentSuccess: (paymentIntent: any) => void,
    onPaymentError: (error: string | undefined) => void
}) => {
    const options: StripeElementsOptions = {
        clientSecret,
        appearance: appearance,
        loader: 'auto',
    };

    if (loading) {
        return <FormLoading />
    }

    if (clientSecret && stripePromise) {
        return (
            <Elements stripe={stripePromise} options={options}>
                <PaymentForm
                    user={user}
                    shippingAddress={shippingAddress}
                    onPaymentSuccess={onPaymentSuccess}
                    onPaymentError={onPaymentError}
                />
            </Elements>
        );
    }
};

export default StripeCheckout;