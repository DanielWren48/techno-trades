import { z } from "zod";
import { last } from "lodash";
import { toast } from "sonner";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useCallback, useState } from "react";
import { convertFileToUrl } from "@/lib/utils";
import { useUploadThing } from "@/uploadthing";
import { CategoryType } from "@/lib/validation";
import { mediaApiEndpoints } from "@/api/client";
import { Button } from "@/components/ui/button";
import { FileWithPath } from "@uploadthing/react";
import { Progress } from "@/components/ui/progress";
import { CircleOff, Loader2, PlusSquare, X } from "lucide-react";
import { useDropzone } from "@uploadthing/react/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateCategory } from "@/api/queries/category";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type TableCellViewerProps = {
    category: CategoryType;
    trigger?: React.ReactNode;
};

export const updateCategorySchema = z.object({
    name: z.string().min(1, { message: "This field is required" }).max(1000, { message: "Maximum 1000 characters." }),
    icon: z.string({ required_error: "This field is required" }).max(20),
    image: z.string({ required_error: "This field is required" })
});

export type UpdateCategorySchemaType = z.infer<typeof updateCategorySchema>;

export function TableCellViewer({ category, trigger }: TableCellViewerProps) {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<FileWithPath | null>();
    const [fileUrl, setFileUrl] = useState<string | undefined>(category.image);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const { mutateAsync: updateCategory, isPending } = useUpdateCategory()
    const form = useForm<UpdateCategorySchemaType>({ resolver: zodResolver(updateCategorySchema), defaultValues: { ...category } });

    const { startUpload, isUploading, permittedFileInfo } = useUploadThing("videoAndImage", {
        onClientUploadComplete: async (res) => {
            if (res && res.length > 0) {
                form.setValue("image", res[0].url);
                toast.success("Image uploaded successfully!", { id: "image-upload" });
            }
        },
        onUploadError: (error: Error) => {
            toast.error(`Error uploading: ${error.message}`, { id: "image-upload" });
        },
        onUploadBegin: () => {
            toast.loading("Uploading image...", { id: "image-upload" });
        },
        onUploadProgress: (progress: number) => setUploadProgress(progress),
    });

    const fileTypes = permittedFileInfo?.config ? Object.keys(permittedFileInfo?.config) : [];

    const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setFileUrl(convertFileToUrl(acceptedFiles[0]));
        }
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: fileTypes ? generateClientDropzoneAccept(fileTypes) : undefined,
        maxFiles: 1,
    });

    const handleRemoveFile = () => {
        setFile(null);
        setFileUrl(undefined);
        form.setValue("image", "");
    };

    const onSubmit = async (values: UpdateCategorySchemaType) => {
        const hasImageChnaged = category.image === form.getValues("image")
        const fileKey = last(category.image.split('/'))
        if (fileKey && !hasImageChnaged) {
            toast.promise(() => mediaApiEndpoints.deleteFiles([fileKey]),
                {
                    id: "image-upload",
                    loading: 'Removing file...',
                    success: () => 'File deleted succesfully',
                    error: () => 'Error deleting files.',
                }
            );
        }
        if (file && hasImageChnaged) {
            const renamedFile = new File([file], `${category.slug}.png`, { type: file.type });
            await startUpload([renamedFile]);
        }

        values = { ...values, image: form.getValues("image") }
        const { code, status, message } = await updateCategory({ id: category._id, ...values })
        if (code === "200" || status === "success") {
            toast.success(message);
        } else if (code === "400" || status === "failure") {
            toast.error(message);
        } else {
            toast.info(message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? (
                    trigger
                ) : (
                    <Button variant="link" className="w-fit px-0 text-right text-foreground capitalize">
                        {category.name}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Update {category.name} category</DialogTitle>
                    <DialogDescription>
                        Update product <span className="italic font-medium">{category.name} category</span>
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id="category-update-form">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="shad-form_label">Name</FormLabel>
                                    <FormControl>
                                        <Input className="h-12" placeholder="Cameras (Plural)" {...field} />
                                    </FormControl>
                                    <FormMessage className="shad-form_message" />
                                    <FormDescription>
                                        This is how your category will appear in the app.
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="icon"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="shad-form_label">Icon</FormLabel>
                                    <FormControl>
                                        <Popover modal={true}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className="h-[100px] w-full"
                                                >
                                                    {form.watch("icon") ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <span className="text-5xl" role="img">
                                                                {field.value}
                                                            </span>
                                                            <p className="text-xs text-muted-foreground">
                                                                Click to change
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <CircleOff className="h-[48px] w-[48px]" />
                                                            <p className="text-xs text-muted-foreground">
                                                                Click to select
                                                            </p>
                                                        </div>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full">
                                                <Picker
                                                    data={data}
                                                    searchPosition={"sticky"}
                                                    categories={"objects"}
                                                    onEmojiSelect={(emoji: { native: string }) => {
                                                        field.onChange(emoji.native);
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </FormControl>
                                    <FormMessage className="shad-form_message" />
                                    <FormDescription>
                                        This is the icon that will represent your category
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="shad-form_label">Image</FormLabel>
                                    <FormControl>
                                        <div className="flex justify-center items-center flex-col border rounded-xl">
                                            <div {...getRootProps()} className="cursor-pointer w-full">
                                                <input {...getInputProps()} className="cursor-pointer" />
                                                {!fileUrl ? (
                                                    <div className="flex justify-center items-center flex-col p-5 h-40">
                                                        <h3 className="text-base font-medium text-gray-700 mb-2 mt-2"> Drag or Drop image here</h3>
                                                        <p className="text-sm text-gray-500 mb-4">PNG, JPEG, JPG</p>
                                                        <Button
                                                            type="button"
                                                            variant={"secondary"}
                                                            disabled={isUploading}
                                                            className="h-10"
                                                        >
                                                            Select from computer
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="relative">
                                                        <img
                                                            src={fileUrl}
                                                            alt="Category image"
                                                            className="h-48 w-full rounded-lg object-contain bg-white p-2"
                                                        />
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="destructive"
                                                            className="absolute top-2 right-2"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRemoveFile();
                                                            }}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage className="shad-form_message" />
                                    <FormDescription>
                                        Image to visually represent this category
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                    </form>
                </Form>

                <DialogFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0">
                    {isUploading && <Progress value={uploadProgress} className="my-2" />}
                    <div className="w-full flex flex-row justify-between gap-5">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                className="w-full"
                                variant={"secondary"}
                                onClick={() => {
                                    form.reset();
                                    setFile(null);
                                    setFileUrl(undefined);
                                }}
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button
                                form="category-update-form"
                                type="submit"
                                className="w-full"
                                disabled={isUploading || form.formState.isSubmitting || isPending}
                            >
                                {(isUploading || form.formState.isSubmitting || isPending) ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                        {isUploading ? "Uploading..." : "Creating..."}
                                    </>
                                ) : (
                                    "Update Category"
                                )}
                            </Button>
                        </DialogClose>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}