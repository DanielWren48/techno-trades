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
import { useForm } from "react-hook-form";
import { ProductType } from "@/lib/validation";
import { useIsMobile } from "@/hooks/use-mobile"
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateProduct } from "@/api/queries/product";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const updateProductSchema = z.object({
    description: z.string().max(15000, { message: "Maximum 5000 characters for the description" }),
});

type UpdateProductSchemaType = z.infer<typeof updateProductSchema>

export function ProductDescriptionUpdateForm({ product }: { product: ProductType; }) {
    const isMobile = useIsMobile()

    const { mutateAsync: updateProduct } = useUpdateProduct();

    const form = useForm<UpdateProductSchemaType>({
        resolver: zodResolver(updateProductSchema),
        defaultValues: { ...product },
    });

    const handleSubmit = async (value: UpdateProductSchemaType) => {
        console.log(value)
        const { message, status } = await updateProduct({ id: product._id!, description: value.description })
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
                id="description-form"
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex flex-col gap-6 w-full max-w-5xl"
            >
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Description</FormLabel>
                            <FormControl>
                                <ScrollArea className="h-full w-full flex-1 [&>[data-radix-scroll-area-viewport]]:max-h-[50vh]">
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
                                        contentEditableClassName="outline-none  text-lg px-8 py-5 text-black caret-yellow-500 
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
                                </ScrollArea>
                            </FormControl>
                            <FormMessage className="shad-form_message" />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    )
}