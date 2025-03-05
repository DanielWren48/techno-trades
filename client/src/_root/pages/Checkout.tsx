import { Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useCallback, useEffect, useState } from "react";
import { cn, formatPrice } from "@/lib/utils";
import StripePaymentForm from '@/components/StripePaymentForm'
import AddressForm, { ShippingAddressFormSchema } from "@/components/addressForm";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CartItem } from "@/components/root";
import { buttonVariants } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import ShippingForm, { ShippingOption } from "@/components/shippingForm";
import { useUserContext } from "@/context/AuthContext";
import { createPaymentIntent } from "@/lib/backend-api/orders";
import { Icons } from "@/components/shared";

export default function Checkout() {
    const { items, clearCart } = useCart();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useUserContext();
    const [isMounted, setIsMounted] = useState<boolean>(false);
    const [selectedShippingOption, setSelectedShippingOption] = useState<ShippingOption>();
    const [shippingAddress, setShippingAddress] = useState<ShippingAddressFormSchema | undefined>(undefined);
    const cartTotal = items.reduce((total, { product, quantity }) => total + (product.isDiscounted ? product.discountedPrice! : product.price) * quantity, 0);

    const [clientSecret, setClientSecret] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/sign-in')
        }
        if (!user.isEmailVerified) {
            navigate(`/dashboard/account/${user._id}`)
        }
        setIsMounted(true)
    }, []);

    const fetchPaymentIntent = useCallback(async () => {
        if (!isAuthenticated || !user?._id || items.length === 0) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const order = items.map(({ product, quantity }) => ({
                productId: product._id!,
                quantity: quantity,
            }));

            const clientSecret = await createPaymentIntent({
                order: order,
                userId: user._id
            });

            if (clientSecret) {
                console.log(clientSecret)
                setClientSecret(clientSecret);
            } else {
                setError("Failed to create payment intent");
            }
        } catch (error) {
            setError("Error creating payment intent");
            console.error("Error fetching payment intent:", error);
        } finally {
            setLoading(false);
        }
    }, [items, user._id]);

    useEffect(() => {
        fetchPaymentIntent();
    }, [fetchPaymentIntent]);

    const handlePaymentSuccess = (paymentIntent: any) => {
        console.log('Payment successful', paymentIntent);
        clearCart()
    };

    const handlePaymentError = (error: any) => {
        console.error('Payment failed', error);
        setError(error);
        return
    };

    return (
        <div className="flex flex-col flex-1 min-h-screen items-center">
            <div className="w-full px-2.5 md:px-10 my-20 max-w-screen-xl">
                <h1 className="text-xl font-bold tracking-tight text-dark-4 dark:text-white/90 sm:text-3xl text-center mb-5">
                    Checkout
                </h1>
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
                    <div className="lg:col-span-3 flex flex-col gap-10">
                        <AddressForm setShippingAddress={setShippingAddress} />
                        <ShippingForm setSelectedShippingOption={setSelectedShippingOption} />
                        {error &&
                            <div className="flex items-center p-4 mb-4 text-sm max-w-[650px] text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800" role="alert">
                                <Icons.info className="shrink-0 inline w-4 h-4 me-3" />
                                <span className="sr-only">Info</span>
                                <div>
                                    <span className="font-medium">Checkout Error!</span> {error.toString()}
                                </div>
                            </div>
                        }
                        <StripePaymentForm
                            loading={loading}
                            clientSecret={clientSecret}
                            onPaymentSuccess={handlePaymentSuccess}
                            onPaymentError={handlePaymentError}
                        />
                    </div>
                    <section className="border lg:col-span-2 mt-16 rounded-lg bg-zinc-50 dark:bg-dark-4 px-4 py-6 sm:p-6 lg:mt-0 lg:p-8 h-fit relative">
                        <div className="w-full flex flex-row justify-between items-center mb-3">
                            <h2 className="text-xl font-normal text-dark-4 dark:text-white/90">Order summary</h2>
                            <Link
                                className={cn(buttonVariants({ variant: "outline" }))}
                                to="/cart"
                            >
                                Edit
                            </Link>
                        </div>
                        <Separator className="w-full absolute right-0 h-0.5" />
                        <ScrollArea className="mt-7">
                            {items.map(({ product, quantity }) => (
                                <CartItem product={product} qty={quantity} key={product._id} allowRemoveItem={false} />
                            ))}
                        </ScrollArea>

                        <Separator className="w-full absolute right-0 h-0.5" />

                        <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">Subtotal</p>
                                <p className="text-sm font-medium text-dark-4 dark:text-white/90">
                                    {isMounted ? (
                                        formatPrice(cartTotal, { currency: "GBP" })
                                    ) : (
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    )}
                                </p>
                            </div>

                            <div className="flex items-center justify-between border-gray-200">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <span>Shipping Method</span>
                                </div>
                                <div className="text-sm capitalize font-medium text-dark-4 dark:text-white/90">
                                    {isMounted && selectedShippingOption ? selectedShippingOption.type : "Not selected"}
                                </div>
                            </div>
                            <div className="flex items-center justify-between border-gray-200">
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <span>Shipping Price</span>
                                </div>
                                <div className="text-sm font-medium text-dark-4 dark:text-white/90">
                                    {isMounted && selectedShippingOption ? formatPrice(selectedShippingOption.price, { currency: "GBP" }) : "Not selected"}
                                </div>
                            </div>

                            <Separator className="w-full absolute right-0 h-0.5" />

                            <div className="flex items-center justify-between border-gray-200 pt-10">
                                <div className="text-lg font-medium text-muted-foreground">
                                    Total
                                </div>
                                <div className="text-xl font-medium text-dark-4 dark:text-white/90">
                                    {isMounted ? (
                                        formatPrice(
                                            selectedShippingOption ? (cartTotal + selectedShippingOption.price) : cartTotal,
                                            { currency: "GBP" }
                                        )
                                    ) : (
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};