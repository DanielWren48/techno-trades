import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { newProductSchema, NewProductSchemaType } from "@/_dashboard/schemas/product";

interface SetProductDiscountFormProps {
    productData: NewProductSchemaType;
    handleTabChange: (value: string) => void
    setProductData: React.Dispatch<React.SetStateAction<NewProductSchemaType | undefined>>;
}

interface DiscountDisplayProps {
    price: number;
    discountPercentage: number | undefined;
}

interface DiscountOptionProps {
    value: string;
    isSelected: boolean;
    onSelect: (value: number) => void;
    originalPrice: number;
}

export default function SetProductDiscountForm({ productData, setProductData, handleTabChange }: SetProductDiscountFormProps) {
    const [discountPercentage, setDiscountPercentage] = useState<number>(0);
    const form = useForm<NewProductSchemaType>({
        resolver: zodResolver(newProductSchema),
        defaultValues: { ...productData },
    });

    const handleSubmit = (data: NewProductSchemaType) => {
        setProductData(data);
        handleTabChange("description")
    };

    useEffect(() => {
        if (!form.getValues("isDiscounted")) {
            form.setValue("discountedPrice", 0);
            setDiscountPercentage(0);
        }
    }, [form.getValues("isDiscounted")]);

    const predefinedDiscounts = ["5", "10", "25", "30", "50", "75"];
    const originalPrice = form.getValues("price");

    const handleManualDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const percentage = Number(e.target.value.slice(0, 2));
        setDiscountPercentage(percentage);
        const discountAmount = originalPrice * (percentage / 100);
        const finalPrice = originalPrice - discountAmount;
        form.setValue("discountedPrice", finalPrice);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-5 w-full font-jost">
                <FormField
                    control={form.control}
                    name="isDiscounted"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                    {(discountPercentage && field.value)
                                        ? `Discount of ${discountPercentage}% will be applied`
                                        : "Set Product Discount"
                                    }
                                </FormLabel>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {form.getValues("isDiscounted") && (
                    <FormField
                        control={form.control}
                        name="discountedPrice"
                        render={({ field }) => (
                            <FormItem className="flex flex-col items-start justify-start bg-neutral-100 dark:bg-dark-4 rounded-lg border p-4">
                                <FormControl>
                                    <div className="flex flex-col w-full gap-5 my-5">
                                        <InfoAlert />

                                        <div className="space-y-5">
                                            <Label>Choose one of:</Label>
                                            <ul className="grid grid-cols-3 gap-5">
                                                {predefinedDiscounts.map((value) => (
                                                    <li key={value}>
                                                        <DiscountOption
                                                            value={value}
                                                            isSelected={discountPercentage === Number(value)}
                                                            onSelect={(finalPrice) => {
                                                                setDiscountPercentage(Number(value));
                                                                field.onChange(finalPrice);
                                                            }}
                                                            originalPrice={originalPrice}
                                                        />
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="manual-input">Or enter manually:</Label>
                                            <Input
                                                id="manual-input"
                                                placeholder="Discount %"
                                                type="number"
                                                className="h-12"
                                                value={discountPercentage || ''}
                                                onChange={handleManualDiscountChange}
                                            />
                                        </div>

                                        <DiscountDisplay
                                            price={originalPrice}
                                            discountPercentage={discountPercentage}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <Button type="submit" variant="default">Continue</Button>
            </form>
        </Form>
    );
};

const DiscountOption = ({ value, isSelected, onSelect, originalPrice }: DiscountOptionProps) => {
    const handleSelect = () => {
        const percentage = Number(value);
        const discountAmount = originalPrice * (percentage / 100);
        const finalPrice = originalPrice - discountAmount;
        onSelect(finalPrice);
    };

    return (
        <Button
            type="button"
            onClick={handleSelect}
            className={cn(
                "border h-16 hover:bg-neutral-200 border-gray-200 p-4 rounded-lg min-w-[100px] w-full text-center text-dark-4 dark:text-light-2/90",
                isSelected ? "bg-gray-300 dark:bg-light-3/80" : "bg-white dark:bg-dark-3"
            )}
        >
            <div className="flex gap-1 justify-center items-center">
                <span className="font-extrabold text-2xl">{value}</span>
                <span>%</span>
            </div>
        </Button>
    );
};

const DiscountDisplay = ({ price, discountPercentage }: DiscountDisplayProps) => {
    if (!discountPercentage) return (
        <div className="flex flex-row justify-around items-start gap-3 text-lg p-4 text-gray-800 border border-gray-300 rounded-lg bg-gray-50 dark:bg-dark-3/50 dark:text-gray-300 dark:border-gray-600">
            <h2>Current Price: <span className="font-semibold">{formatPrice(price, { currency: "GBP" })}</span></h2>
        </div>
    );

    const discountAmount = price * (discountPercentage / 100);
    const finalPrice = price - discountAmount;

    return (
        <div className="flex flex-row justify-around items-start gap-3 text-lg p-4 text-gray-800 border border-gray-300 rounded-lg bg-gray-50 dark:bg-dark-3/50 dark:text-gray-300 dark:border-gray-600">
            <h2>Original Price: <span className="font-semibold">{formatPrice(price, { currency: "GBP" })}</span></h2>
            <h2>Discount of: <span className="text-red-600 font-semibold">{formatPrice(discountAmount, { currency: "GBP" })}</span></h2>
            <h2>Final Price: <span className="text-blue-500 font-semibold">{formatPrice(finalPrice, { currency: "GBP" })}</span></h2>
        </div>
    );
};

const InfoAlert = () => (
    <div className="flex items-center p-4 mb-4 text-sm text-blue-800 border border-blue-300 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800">
        <AlertCircle className="w-6 h-6 mr-2" />
        <span className="text-base font-medium">
            You will be able to modify the discount at the admin dashboard later!
        </span>
    </div>
);
