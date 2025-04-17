import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import useProductStore from "@/hooks/useProductStore";
import { categories } from "@/components/tables/products-table/filters";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { newProductSchema, NewProductSchemaType } from "@/_dashboard/schemas/product";

interface NewProductProps {
    handleTabChange: (value: string) => void
}

export default function NewProductCreateDetails({ handleTabChange }: NewProductProps) {
    const { productData, updateProductData, markStepCompleted } = useProductStore();

    const form = useForm<NewProductSchemaType>({
        resolver: zodResolver(newProductSchema),
        defaultValues: productData || {
            name: "",
            brand: "",
            description: "",
            price: 0,
            countInStock: 0,
            isDiscounted: false,
            discountedPrice: undefined
        },
    });

    useEffect(() => {
        if (productData) {
            Object.entries(productData).forEach(([key, value]) => {
                if (value !== undefined) {
                    form.setValue(key as any, value);
                }
            });
        }
    }, [form, productData]);

    const handleSubmit = async (data: NewProductSchemaType) => {
        updateProductData(data);
        markStepCompleted('details');
        handleTabChange("discount");
    };

    return (
        <>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="flex flex-col gap-5 w-full font-jost"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="shad-form_label">Product Name</FormLabel>
                                <FormControl>
                                    <Input type="text" className="h-12" {...field} />
                                </FormControl>
                                <FormMessage className="shad-form_message" />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-8">
                        <FormField
                            control={form.control}
                            name="brand"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="shad-form_label">
                                        Product Brand
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="text" className="h-12" {...field} />
                                    </FormControl>
                                    <FormMessage className="shad-form_message" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="shad-form_label">
                                        Product Category
                                    </FormLabel>

                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="h-12">
                                                <SelectValue placeholder="Select a Category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectGroup>
                                                {categories.map((status, index) => (
                                                    <SelectItem key={index} value={status.value}>
                                                        <span className="flex items-center">
                                                            <status.icon className="mr-2 h-5 w-5 text-muted-foreground" />
                                                            {status.label}
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="shad-form_message" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-8">
                        <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="shad-form_label">
                                        Product Price
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="number" className="h-12" {...field} />
                                    </FormControl>
                                    <FormMessage className="shad-form_message" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="countInStock"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="shad-form_label">
                                        Product Stock
                                    </FormLabel>
                                    <FormControl>
                                        <Input type="number" className="h-12" {...field} />
                                    </FormControl>
                                    <FormMessage className="shad-form_message" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <Button type="submit" variant={"default"}>Continue</Button>
                </form>
            </Form>
        </>
    );
};