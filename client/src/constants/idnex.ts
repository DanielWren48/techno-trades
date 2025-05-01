import { categories } from "@/components/tables/products-table/filters";
import { Appearance, StripePaymentElementOptions } from '@stripe/stripe-js';

export interface SortCategory {
    value: string;
    label: string;
}

interface ShowPerPageOption {
    value: number;
    label: string;
}

export const sortCategories: SortCategory[] = [
    {
        value: "relevance",
        label: "Sort By: Relevance",
    },
    {
        value: "brandAsc",
        label: "Sort By: Brand - A to Z",
    },
    {
        value: "brandDesc",
        label: "Sort By: Brand - Z to A",
    },
    {
        value: "priceAsc",
        label: "Sort By: Price - low to high",
    },
    {
        value: "priceDesc",
        label: "Sort By: Price - hight to low",
    },
    {
        value: "customerRating",
        label: "Sort By: Customer Rating",
    },
    {
        value: "deals",
        label: "Sort By: Deals",
    },
];

export const showPerPage: ShowPerPageOption[] = [
    {
        value: 5,
        label: "Show: 5",
    },
    {
        value: 10,
        label: "Show: 10",
    },
    {
        value: 20,
        label: "Show: 20",
    },
    {
        value: 999,
        label: "Show: All",
    },
];

interface PriceRanges {
    min: number;
    max: number;
}

export const priceRanges: PriceRanges[] = [
    { min: 10, max: 100 },
    { min: 100, max: 500 },
    { min: 500, max: 1000 },
    { min: 1000, max: 5000 },
];

export const stripePaymentElementOptions: StripePaymentElementOptions = {
    fields: {
        billingDetails: {
            address: {
                country: 'never',
                postalCode: 'never',
            }
        }
    },
    layout: {
        type: 'accordion',
    },
};

export const appearance: Appearance = {
    theme: 'stripe',
    variables: {
        colorPrimary: '#0047AB',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '4px',
    },
    rules: {
        '.Label': {
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#6b7280'
        },
        '.Input': {
            padding: '12px',
            fontSize: '16px',
            color: '#1f2937',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '4px'
        },
        '.AccordionItem': {
            padding: '20px 120px',
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
        }
    }
};