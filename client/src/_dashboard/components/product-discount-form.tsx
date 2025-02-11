import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { newProductSchema, NewProductSchemaType } from "../schemas/product";

interface SetProductDiscountFormProps {
    productData: NewProductSchemaType
    setActiveTabs: React.Dispatch<React.SetStateAction<string[]>>
    setProductData: React.Dispatch<React.SetStateAction<NewProductSchemaType | undefined>>
}

export default function SetProductDiscountForm({ productData, setProductData, setActiveTabs }: SetProductDiscountFormProps) {
    const [discount, setDiscount] = useState<number | undefined>(undefined);

    const form = useForm<NewProductSchemaType>({
        resolver: zodResolver(newProductSchema),
        values: {...productData},
    });

    const handleSubmit = async (data: NewProductSchemaType) => {
        setProductData({...data})
        setActiveTabs(["description"])
    };

    const StatBox = ({ value }: { value: string }) => (
        <Button
            type="button"
            onClick={() => setDiscount(Number(value))}
            className={cn(
                `border h-16 hover:bg-neutral-200 border-gray-200 p-4 rounded-lg min-w-[100px] w-full text-center text-dark-4 dark:text-light-2/90
            ${discount === +value ? 'bg-gray-300 dark:bg-light-3/80' : 'bg-white dark:bg-dark-3'}`
            )}
        >
            <div className="flex gap-1">
                <h4 className="font-extrabold text-2xl">{value}</h4>
                <p>%</p>
            </div>
        </Button>
    );

    return (
        <>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="flex flex-col gap-5 w-full font-jost"
                >
                    <FormField
                        control={form.control}
                        name="isDiscounted"
                        render={({ field }) => (
                            <>
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            {(discount && form.getValues("isDiscounted")) ? `Discout of ${discount}% will be applied` : "Set Product Discount"}
                                        </FormLabel>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                                <FormMessage className="shad-form_message" />
                            </>
                        )}
                    />

                    {form.getValues("isDiscounted") === true && (
                        <FormField
                            control={form.control}
                            name="discountedPrice"
                            render={({ field }) => (
                                <FormItem className="flex flex-col items-start justify-start bg-neutral-100 dark:bg-dark-4 rounded-lg border p-4">
                                    <FormControl>
                                        <div className="flex flex-col w-full  mx-auto gap-5 my-5">
                                            <div className="flex items-center p-4 mb-4 text-sm text-blue-800 border border-blue-300 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800" role="alert">
                                                <AlertCircle className="w-6 h-6 mr-2" />
                                                <span className="sr-only">Info</span>
                                                <div className="text-base">
                                                    <span className="font-medium">You will be able to modify the discount at the admin dashboard later!</span>
                                                </div>
                                            </div>
                                            <Label>Choose one of:</Label>
                                            <div>
                                                <ul className="grid grid-cols-4 gap-5">
                                                    <StatBox value="10" />
                                                    <StatBox value="20" />
                                                    <StatBox value="30" />
                                                    <StatBox value="50" />
                                                </ul>
                                            </div>
                                            <br />
                                            <Label htmlFor="inputs">Or enter manually:</Label>
                                            <Input
                                                id="input"
                                                placeholder="Discount %"
                                                type="number"
                                                className="h-12"
                                                value={discount}
                                                onChange={(e) => setDiscount(Number(e.target.value.slice(0, 2)))}
                                            />
                                            <div className="flex flex-row justify-around items-start gap-3 text-lg p-4 text-gray-800 border border-gray-300 rounded-lg bg-gray-50 dark:bg-dark-3/50 dark:text-gray-300 dark:border-gray-600" role="alert">
                                                <span className="sr-only">Info</span>
                                                <h1>Current Price: <span className="font-semibold">{formatPrice(form.getValues("price"), { currency: "GBP" })}</span></h1>
                                                {!!discount && <h1>Discount of: <span className="text-red-600 font-semibold">{formatPrice(form.getValues("price") * discount / 100, { currency: "GBP" })}</span></h1>}
                                                {!!discount && <h1>Discounted Price:  <span className="text-blue-500 font-semibold">{formatPrice(form.getValues("price") - form.getValues("price") * discount / 100, { currency: "GBP" })}</span></h1>}
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage className="shad-form_message" />
                                </FormItem>
                            )}
                        />
                    )}
                    <Button type="submit" variant={"default"}>Continue</Button>
                </form>
            </Form>
        </>
    );
};