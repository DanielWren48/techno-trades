import { ShippingAddressFormSchema } from "@/_root/components/addressForm";
import { ShippingOption } from "@/_root/components/shippingForm";

export interface NewOrder {
    order: { productId: string; quantity: number }[];
    userId: string;
    shippingAddress: ShippingAddressFormSchema,
    selectedShippingOption: ShippingOption
}

export type CreateCheckout = {
    clientSecret: string
};