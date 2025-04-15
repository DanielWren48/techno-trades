"use client"

import {
    MDXEditor,
    toolbarPlugin,
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    linkPlugin,
    markdownShortcutPlugin,
    frontmatterPlugin,
    codeBlockPlugin,
    codeMirrorPlugin,
    diffSourcePlugin,
    directivesPlugin,
    linkDialogPlugin,
    BoldItalicUnderlineToggles,
    CreateLink,
    UndoRedo,
    ListsToggle,
    Separator,
    BlockTypeSelect,
    tablePlugin,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { z } from "zod";
import { toast } from "sonner";
import { categories } from "../filters";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { ProductType } from "@/lib/validation";
import { useIsMobile } from "@/hooks/use-mobile"
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateProduct } from "@/api/queries/product";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const updateProductSchema = z.object({
    name: z.string().min(1, { message: "This field is required" }).max(1000, { message: "Maximum 1000 characters." }),
    brand: z.string().min(1, { message: "This field is required" }).max(1000, { message: "Maximum 1000 characters." }),
    category: z.enum(["smartphones", "cameras", "computers", "televisions", "consoles", "audio", "mouse", "keyboard"]),
    description: z.string().max(5000, { message: "Maximum 5000 characters for the description" }),
    price: z.coerce.number().min(0, { message: "Price must be a non-negative number" }),
    countInStock: z.coerce.number().min(0, { message: "Stock must be a non-negative number" }),
});

type UpdateProductSchemaType = z.infer<typeof updateProductSchema>

export function ProductUpdateForm({ product }: { product: ProductType; }) {
    const isMobile = useIsMobile()

    const { mutateAsync: updateProduct } = useUpdateProduct();

    const form = useForm<UpdateProductSchemaType>({
        resolver: zodResolver(updateProductSchema),
        defaultValues: {
            name: product.name,
            brand: product.brand,
            category: product.category,
            description: product.description,
            price: product.price,
            countInStock: product.countInStock,
        },
    });

    const handleSubmit = async (value: UpdateProductSchemaType) => {
        const { message, status } = await updateProduct({
            id: product._id!,
            ...value,
        })
        if (status === "success") {
            toast.success(message)
        }
        if (status === "failure") {
            toast.error(message)
        }
    }

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
                                <Input type="text" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-8">
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
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="shad-form_label">Category</FormLabel>

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
                        name="countInStock"
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

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Description</FormLabel>
                            <FormControl>
                                <MDXEditor
                                    markdown={field.value}
                                    {...field}
                                    plugins={[
                                        toolbarPlugin({
                                            toolbarContents: () => (
                                                <>
                                                    <UndoRedo />
                                                    <Separator />
                                                    <BoldItalicUnderlineToggles />
                                                    <Separator />
                                                    <ListsToggle />
                                                    <Separator />
                                                    <BlockTypeSelect />
                                                    <Separator />
                                                    <CreateLink />
                                                </>
                                            )
                                        }),
                                        headingsPlugin(),
                                        listsPlugin(),
                                        quotePlugin(),
                                        linkPlugin(),
                                        markdownShortcutPlugin(),
                                        frontmatterPlugin(),
                                        codeBlockPlugin(),
                                        codeMirrorPlugin(),
                                        diffSourcePlugin(),
                                        directivesPlugin(),
                                        linkDialogPlugin(),
                                        tablePlugin(),
                                    ]}
                                    contentEditableClassName="outline-none min-h-[500px] max-w-none text-lg px-8 py-5 text-black caret-yellow-500 
                                    prose 
                                    prose-p:my-3 
                                    prose-p:leading-relaxed 
                                    prose-headings:my-4 
                                    prose-blockquote:my-4 
                                    prose-ul:my-2 
                                    prose-li:my-0 
                                    prose-code:px-1 
                                    prose-code:text-red-500 
                                    prose-code:before:content-[''] 
                                    prose-code:after:content-['']
                                    pro
                                    "
                                    className="border rounded-md"
                                    spellCheck
                                    placeholder={""}
                                />
                            </FormControl>
                            <FormMessage className="shad-form_message" />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    )
}