import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import useProductStore from "@/hooks/useProductStore";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { newProductSchema, NewProductSchemaType } from "@/_dashboard/schemas/product";
import { Plus, Trash2 } from "lucide-react";
import CategoryPicker from "../category/category-picker";
import SubCategoryPicker from "../category/sub-category-picker";
import SkeletonWrapper from "@/components/root/SkeletonWrapper";

interface NewProductProps {
    handleTabChange: (value: string) => void
}

export default function NewProductCreateDetails({ handleTabChange }: NewProductProps) {
    const { productData, updateProductData, markStepCompleted } = useProductStore();

    const form = useForm<NewProductSchemaType>({
        resolver: zodResolver(newProductSchema),
        defaultValues: productData || {
            name: "",
            model: "",
            brand: "",
            category: "",
            sub_category: "",
            description: "",
            price: 0,
            stock: 0,
            isDiscounted: false,
            discountedPrice: undefined,
            specifications: [],
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: "specifications",
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

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
        const pastedText = event.clipboardData.getData("text");
        const lines = pastedText.split("\n").filter(Boolean);

        const parsed = lines.map(line => {
            const [key, ...rest] = line.split("\t");
            return { key: key.trim(), value: rest.join("\t").trim() };
        });

        event.preventDefault();
        replace(parsed);
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
                            name="model"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="shad-form_label">Product Model</FormLabel>
                                    <FormControl>
                                        <Input type="text" className="h-12" {...field} />
                                    </FormControl>
                                    <FormMessage className="shad-form_message" />
                                </FormItem>
                            )}
                        />

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
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-8">
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem className="flex flex-col mt-1.5">
                                    <FormLabel className="shad-form_label">Category</FormLabel>
                                    <FormControl>
                                        <CategoryPicker defValue={field.value} onChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage className="shad-form_message" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="sub_category"
                            render={({ field }) => (
                                <FormItem className="flex flex-col mt-1.5">
                                    <FormLabel className="shad-form_label">Subcategory</FormLabel>
                                    <FormControl>
                                        <SkeletonWrapper isLoading={!form.watch("category")}>
                                            <SubCategoryPicker categoryId={form.watch("category")} onChange={field.onChange} />
                                        </SkeletonWrapper>
                                    </FormControl>
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
                            name="stock"
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

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <FormLabel className="text-base font-medium">Specifications</FormLabel>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({ key: "", value: "" })}
                            >
                                <Plus className="w-4 h-4 mr-1" /> Add Spec
                            </Button>
                        </div>

                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-12 gap-3 items-end">
                                <FormField
                                    control={form.control}
                                    name={`specifications.${index}.key`}
                                    render={({ field }) => (
                                        <FormItem className="col-span-5">
                                            {index === 0 && <FormLabel className="shad-form_label">Key</FormLabel>}
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    className="h-12"
                                                    onPaste={(index === 0) ? handlePaste : undefined}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`specifications.${index}.value`}
                                    render={({ field }) => (
                                        <FormItem className="col-span-6">
                                            {index === 0 && <FormLabel className="shad-form_label">Value</FormLabel>}
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    className="h-12"
                                                    onPaste={(index === 0) ? handlePaste : undefined}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="col-span-1 mt-2"
                                    onClick={() => remove(index)}
                                >
                                    <Trash2 className="w-5 h-5 text-red-500" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <Button type="submit" variant={"default"}>Continue</Button>
                </form>
            </Form>
        </>
    );
};