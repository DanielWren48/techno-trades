import { z } from "zod";
import { toast } from "sonner";
import data from "@emoji-mart/data";
import { ICategory } from "@/types";
import Picker from "@emoji-mart/react";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useUploadThing } from "@/uploadthing";
import { convertFileToUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileWithPath } from "@uploadthing/react";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useDropzone } from "@uploadthing/react/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleOff, Loader2, PlusSquare, X } from "lucide-react";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { ReactNode, useCallback, useState } from "react";
import { useCreateNewCategory, useGetCategories } from "@/api/queries/category";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Props {
    trigger?: ReactNode;
    successCallback: (category: ICategory) => void;
}

export const newCategorySchema = z.object({
    name: z.string().min(1, { message: "This field is required" }).max(1000, { message: "Maximum 1000 characters." }),
    icon: z.string({ required_error: "This field is required" }).max(20),
    image: z.string({ required_error: "This field is required" }),
    parent: z.string().optional(),
});

export type NewCategorySchemaType = z.infer<typeof newCategorySchema>;

export default function CreateCategoryDialog({ successCallback, trigger }: Props) {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<FileWithPath | null>();
    const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isSubcategory, setIsSubcategory] = useState(false);
    
    const form = useForm<NewCategorySchemaType>({ resolver: zodResolver(newCategorySchema) });
    const { mutateAsync: createCategory, isPending } = useCreateNewCategory();
    const { data: categoriesData } = useGetCategories();

    const { startUpload, isUploading, permittedFileInfo } = useUploadThing("videoAndImage", {
        onClientUploadComplete: (res) => {
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
            form.setValue("image", convertFileToUrl(acceptedFiles[0]))
            setFileUrl(convertFileToUrl(acceptedFiles[0]));
        }
    }, [form]);

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

    const onSubmit = async (values: NewCategorySchemaType) => {
        if (file) {
            const renamedFile = new File([file], `${values.name}.png`, { type: file.type });
            await startUpload([renamedFile]);
        }

        values = {
            ...values,
            image: form.getValues("image"),
            parent: isSubcategory ? values.parent : undefined
        };

        const { data, code, status, message } = await createCategory(values);
        if (code === "201" || status === "success") {
            toast.success(message);
            console.log(data)
            data && successCallback(data);

            form.reset();
            setFile(null);
            setFileUrl(undefined);
            setIsSubcategory(false);
            setOpen(false);
        } else if (code === "400" || status === "failure") {
            toast.error(message);
        } else {
            toast.info(message);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? (
                    trigger
                ) : (
                    <Button
                        variant={"ghost"}
                        className="flex border-separate items-center justify-start roudned-none border-b px-3 py-3 text-muted-foreground"
                    >
                        <PlusSquare className="mr-2 h-4 w-4" />
                        Create new
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Create category</DialogTitle>
                    <DialogDescription>
                        Categories are used to group your transactions
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="shad-form_label">Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Cameras (Plural)" {...field} />
                                    </FormControl>
                                    <FormMessage className="shad-form_message" />
                                    <FormDescription>
                                        This is how your category will appear in the app.
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="subcategory"
                                checked={isSubcategory}
                                onCheckedChange={(checked) => {
                                    setIsSubcategory(!!checked);
                                    if (!checked) {
                                        form.setValue("parent", undefined);
                                    }
                                }}
                            />
                            <Label
                                htmlFor="subcategory"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Create as subcategory
                            </Label>
                        </div>

                        {isSubcategory && (
                            <FormField
                                control={form.control}
                                name="parent"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="shad-form_label">Parent Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a parent category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categoriesData?.data?.map((category: ICategory) => (
                                                    <SelectItem key={category._id} value={category._id} className="cursor-pointer">
                                                        <div className="flex items-center gap-2">
                                                            <span role="img" className="text-lg">{category.icon}</span>
                                                            <span className="capitalize">{category.name}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="shad-form_message" />
                                        <FormDescription>
                                            Select the parent category this will be nested under
                                        </FormDescription>
                                    </FormItem>
                                )}
                            />
                        )}

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

                <DialogFooter className="flex sm:flex-col gap-5">
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
                                    setIsSubcategory(false);
                                }}
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            className="w-full"
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isUploading || form.formState.isSubmitting || isPending}
                        >
                            {(isUploading || form.formState.isSubmitting || isPending) ? (
                                <>
                                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                    {isUploading ? "Uploading..." : "Creating..."}
                                </>
                            ) : (
                                "Create Category"
                            )}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}