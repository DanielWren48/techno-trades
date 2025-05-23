import { z } from "zod";
import { toast } from "sonner";
import { ICategory } from "@/types";
import { Plus, Trash2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { ProductType } from "@/lib/validation";
import { Button } from '@/components/ui/button';
import { useIsMobile } from "@/hooks/use-mobile"
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { useUpdateProduct } from "@/api/queries/product";
import { ScrollArea } from '@/components/ui/scroll-area';
import SkeletonWrapper from "@/components/root/SkeletonWrapper";
import CategoryPicker from "@/_dashboard/components/category/category-picker";
import SubCategoryPicker from "@/_dashboard/components/category/sub-category-picker";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const updateProductSchema = z.object({
    name: z.string().min(1, { message: "This field is required" }).max(1000, { message: "Maximum 1000 characters." }),
    brand: z.string().min(1, { message: "This field is required" }).max(1000, { message: "Maximum 1000 characters." }),
    model: z.string().min(1, { message: "This field is required" }).max(1000, { message: "Maximum 1000 characters." }),
    category: z.string().min(1, { message: "This field is required" }).max(1000, { message: "Maximum 1000 characters." }),
    sub_category: z.string().min(1, { message: "This field is required" }).max(1000, { message: "Maximum 1000 characters." }),
    price: z.coerce.number().min(0, { message: "Price must be a non-negative number" }),
    stock: z.coerce.number().min(0, { message: "Stock must be a non-negative number" }),
    specifications: z.array(z.object({
        key: z.string().min(1, { message: 'Key is required' }),
        value: z.string().min(1, { message: 'Value is required' }),
    })).nullable(),
});

export function ProductDetailsUpdateForm({ product }: { product: ProductType; }) {
    const isMobile = useIsMobile()
    const parentCategory = product.category.parent as ICategory
    const { mutateAsync: updateProduct } = useUpdateProduct();

    const form = useForm<z.infer<typeof updateProductSchema>>({
        resolver: zodResolver(updateProductSchema),
        defaultValues: {
            name: product.name,
            model: product.model,
            brand: product.brand,
            category: parentCategory._id,
            sub_category: product.category._id,
            price: product.price,
            stock: product.stock,
            specifications: product.specifications
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: "specifications",
    });

    const handleSubmit = async (value: z.infer<typeof updateProductSchema>) => {
        const { data, message, status } = await updateProduct({
            id: product._id,
            ...value,
            description: product.description,
            category: value.sub_category,
        })
        if (status === "success") {
            toast.success(message)
        }
        if (status === "failure") {
            toast.error(message)
        }
    }

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
        <Form {...form}>
            <form
                id="details-form"
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex flex-col gap-6 w-full max-w-5xl"
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input type="text" className="h-12" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-8">
                    <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Model</FormLabel>
                                <FormControl>
                                    <Input type="text" className="h-12" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="brand"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="shad-form_label">Brand</FormLabel>
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
                                        <SubCategoryPicker categoryId={form.watch("category")} subCategoryId={field.value} onChange={field.onChange} />
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
                                <FormLabel className="shad-form_label">Price</FormLabel>
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
                                <FormLabel className="shad-form_label">Stock</FormLabel>
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
                            <Plus className="w-4 h-4 mr-1" /> Add Specification
                        </Button>
                    </div>

                    <ScrollArea className="h-full w-full flex-1 [&>[data-radix-scroll-area-viewport]]:max-h-[30vh]">
                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-12 gap-3 items-end p-1">
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
                    </ScrollArea>
                </div>
            </form>
        </Form>
    )
}