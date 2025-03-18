import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatDate, formatPrice } from "@/lib/utils";

export interface ShippingOption {
    type: ShippingType;
    price: number;
    minDeliveryDays: number;
    maxDeliveryDays: number;
}

type ShippingType = 'free' | 'express';

export const shippingOptions: ShippingOption[] = [
    {
        type: 'free',
        price: 0,
        minDeliveryDays: 3,
        maxDeliveryDays: 7,
    },
    {
        type: 'express',
        price: 10,
        minDeliveryDays: 2,
        maxDeliveryDays: 3
    }
];

const calculateDeliveryDates = (minDays: number, maxDays: number) => {
    const today = new Date();

    const minDeliveryDate = new Date(today);
    minDeliveryDate.setDate(today.getDate() + minDays);

    const maxDeliveryDate = new Date(today);
    maxDeliveryDate.setDate(today.getDate() + maxDays);

    return {
        minDate: formatDate(minDeliveryDate, 'short'),
        maxDate: formatDate(maxDeliveryDate, 'short')
    };
};

interface ShippingFormProps {
    setSelectedShippingOption: React.Dispatch<React.SetStateAction<ShippingOption | undefined>>
}

export default function ShippingForm({ setSelectedShippingOption }: ShippingFormProps) {
    const handleShippingOptionChange = (optionType: ShippingType) => {
        const selectedOption = shippingOptions.find(option => option.type === optionType);
        if (selectedOption) {
            setSelectedShippingOption(selectedOption);
        }
    };

    return (
        <Card className="w-full max-w-[650px] shadow-md">
            <CardHeader>
                <CardTitle className="text-xl font-semibold">Shipping Method</CardTitle>
            </CardHeader>
            <CardContent>
                <RadioGroup
                    className="flex flex-col space-y-1"
                    onValueChange={(value) => { handleShippingOptionChange(value as ShippingType) }}
                >
                    {shippingOptions.map((option, id) => {
                        const { minDate, maxDate } = calculateDeliveryDates(option.minDeliveryDays, option.maxDeliveryDays);

                        return (
                            <div key={id} className="flex items-center space-x-3 space-y-0 rounded-lg border px-4 py-2" >
                                <RadioGroupItem value={option.type} id={option.type} />
                                <div className="w-full flex items-center justify-between">
                                    <div className="flex flex-col mx-2">
                                        <Label htmlFor={option.type} className="font-semibold capitalize text-lg">{option.type}</Label>
                                        <Label htmlFor={option.type} className="font-light leading-5">
                                            Delivery between: {minDate} - {maxDate}
                                        </Label>
                                    </div>
                                    <Label className="font-semibold text-lg">{formatPrice(option.price, {currency: 'GBP'})}</Label>
                                </div>
                            </div>
                        );
                    })}
                </RadioGroup>
            </CardContent>
        </Card>
    );
};