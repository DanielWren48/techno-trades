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
import { z } from "zod";
import { toast } from "sonner";
import data from "@emoji-mart/data";
import { ICategory } from "@/types";
import Picker from "@emoji-mart/react";
import { useForm } from "react-hook-form";
import '@mdxeditor/editor/style.css';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useUploadThing } from "@/uploadthing";
import { convertFileToUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileWithPath } from "@uploadthing/react";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useDropzone } from "@uploadthing/react/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleOff, Loader2, PlusSquare, X } from "lucide-react";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
    desc: z.string().max(15000, { message: "Maximum 15000 characters." }),
    display: z.object({
        title: z.string().max(300, { message: "Maximum 300 characters." }),
        subtitle: z.string().max(300, { message: "Maximum 300 characters." }),
        image: z.string({ required_error: "This field is required" }),
        colour: z.string().refine((value) => /^#[0-9A-F]{6}$/i.test(value ?? ""), 'Must be a valid hex colour')
    })
});

export type NewCategorySchemaType = z.infer<typeof newCategorySchema>;

export default function CreateCategoryDialog({ successCallback, trigger }: Props) {
    const [open, setOpen] = useState(false);
    // Main category image state
    const [file, setFile] = useState<FileWithPath | null>();
    const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);

    // Display image state
    const [displayFile, setDisplayFile] = useState<FileWithPath | null>();
    const [displayFileUrl, setDisplayFileUrl] = useState<string | undefined>(undefined);

    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const { mutateAsync: createCategory, isPending } = useCreateNewCategory();

    const [color, setColor] = useState("#aabbcc");

    const form = useForm<NewCategorySchemaType>({
        resolver: zodResolver(newCategorySchema),
        defaultValues: {
            name: "",
            icon: "",
            desc: "",
            image: "",
            display: {
                title: "",
                subtitle: "",
                image: "",
                colour: "#aabbcc"
            }
        }
    });

    const { startUpload, isUploading, permittedFileInfo } = useUploadThing("categories", {
        onClientUploadComplete: (res) => {
            if (res && res.length > 0) {
                for (const result of res) {
                    if (result.name.startsWith("category_")) {
                        form.setValue("image", result.url);
                        toast.success("Category image uploaded successfully!", { id: "category-image-upload" });
                    } else if (result.name.startsWith("display_")) {
                        form.setValue("display.image", result.url);
                        toast.success("Display image uploaded successfully!", { id: "display-image-upload" });
                    }
                }
            }
        },
        onUploadError: (error: Error) => {
            toast.error(`Error uploading: ${error.message}`);
        },
        onUploadBegin: (fileName) => {
            const uploadId = fileName.startsWith("category_") ? "category-image-upload" : "display-image-upload";
            toast.loading(`Uploading ${fileName}...`, { id: uploadId });
        },
        onUploadProgress: (progress: number) => setUploadProgress(progress),
    });

    const fileTypes = permittedFileInfo?.config ? Object.keys(permittedFileInfo?.config) : [];

    const onDropMainImage = useCallback((acceptedFiles: FileWithPath[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            form.setValue("image", convertFileToUrl(acceptedFiles[0]))
            setFileUrl(convertFileToUrl(acceptedFiles[0]));
        }
    }, [form]);

    const { getRootProps: getMainImageRootProps, getInputProps: getMainImageInputProps } = useDropzone({
        onDrop: onDropMainImage,
        accept: fileTypes ? generateClientDropzoneAccept(fileTypes) : undefined,
        maxFiles: 1,
    });

    const onDropDisplayImage = useCallback((acceptedFiles: FileWithPath[]) => {
        if (acceptedFiles.length > 0) {
            setDisplayFile(acceptedFiles[0]);
            setDisplayFileUrl(convertFileToUrl(acceptedFiles[0]));
        }
    }, []);

    const { getRootProps: getDisplayImageRootProps, getInputProps: getDisplayImageInputProps } = useDropzone({
        onDrop: onDropDisplayImage,
        accept: fileTypes ? generateClientDropzoneAccept(fileTypes) : undefined,
        maxFiles: 1,
    });

    const handleRemoveMainFile = () => {
        setFile(null);
        setFileUrl(undefined);
        form.setValue("image", "");
    };

    const handleRemoveDisplayFile = () => {
        setDisplayFile(null);
        setDisplayFileUrl(undefined);
        form.setValue("display.image", "");
    };

    const onSubmit = async (values: NewCategorySchemaType) => {
        console.log({ values })
        try {
            // First handle file uploads before sending the form data
            if (file || displayFile) {
                toast.loading("Uploading images...", { id: "upload-progress" });

                // Prepare files for upload
                const filesToUpload = [];

                if (file) {
                    const renamedFile = new File([file], `category_${values.name}.png`, { type: file.type });
                    filesToUpload.push(renamedFile);
                }

                if (displayFile) {
                    const renamedDisplayFile = new File([displayFile], `display_${values.name}.png`, { type: displayFile.type });
                    filesToUpload.push(renamedDisplayFile);
                }

                // Upload the files and wait for completion
                if (filesToUpload.length > 0) {
                    const uploadResult = await startUpload(filesToUpload);

                    // Update form values with the returned URLs
                    if (uploadResult) {
                        for (const result of uploadResult) {
                            if (result.name.startsWith("category_")) {
                                form.setValue("image", result.url);
                            } else if (result.name.startsWith("display_")) {
                                form.setValue("display.image", result.url);
                            }
                        }
                    }
                }
                toast.dismiss("upload-progress");
            }

            const submissionValues = {
                ...values,
                image: form.getValues("image"),
                display: {
                    ...values.display,
                    image: form.getValues("display.image")
                }
            };
            console.log({ submissionValues })

            const { data, code, status, message } = await createCategory(submissionValues);
            console.log({ data })
            if (code === "201" || status === "success") {
                toast.success(message);
                console.log(data);
                data && successCallback(data);

                form.reset();
                setFile(null);
                setFileUrl(undefined);
                setDisplayFile(null);
                setDisplayFileUrl(undefined);
                setOpen(false);
            } else if (code === "400" || status === "failure") {
                toast.error(message);
            } else {
                toast.info(message);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            toast.error("Failed to create category");
        }
    };

    // Reset form and state when dialog closes
    useEffect(() => {
        if (!open) {
            form.reset();
            setFile(null);
            setFileUrl(undefined);
            setDisplayFile(null);
            setDisplayFileUrl(undefined);
        }
    }, [open, form]);

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
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Create category</DialogTitle>
                    <DialogDescription>
                        Categories are used to group the products
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Tabs defaultValue="details" className="w-full">
                            <TabsList className="w-full">
                                <TabsTrigger className="w-full" value="details">Details</TabsTrigger>
                                <TabsTrigger className="w-full" value="description">Description</TabsTrigger>
                                <TabsTrigger className="w-full" value="display">Display</TabsTrigger>
                            </TabsList>
                            <TabsContent value="details">
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
                                            <FormLabel className="shad-form_label">Category Image</FormLabel>
                                            <FormControl>
                                                <div className="flex justify-center items-center flex-col border rounded-xl">
                                                    <div {...getMainImageRootProps()} className="cursor-pointer w-full">
                                                        <input {...getMainImageInputProps()} className="cursor-pointer" />
                                                        {!fileUrl ? (
                                                            <div className="flex justify-center items-center flex-col p-5 h-40">
                                                                <h3 className="text-base font-medium text-gray-700 mb-2 mt-2">Drag or Drop category image here</h3>
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
                                                                        handleRemoveMainFile();
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
                            </TabsContent>
                            <TabsContent value="description">
                                <FormField
                                    control={form.control}
                                    name="desc"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <MDXEditor
                                                    markdown={field.value ?? ''}
                                                    onChange={field.onChange}
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
                                                    placeholder={"Describe this category"}
                                                />
                                            </FormControl>
                                            <FormMessage className="shad-form_message" />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>
                            <TabsContent value="display">
                                {/* Display section with title, subtitle, image and color */}
                                <h3 className="font-medium">Category Banner Display</h3>
                                <p className="text-sm text-muted-foreground">These settings control how the category appears in banners and featured sections</p>

                                <FormField
                                    control={form.control}
                                    name="display.title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="shad-form_label">Banner Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Featured Cameras" {...field} />
                                            </FormControl>
                                            <FormMessage className="shad-form_message" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="display.subtitle"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="shad-form_label">Banner Subtitle</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Capture amazing moments" {...field} />
                                            </FormControl>
                                            <FormMessage className="shad-form_message" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="display.colour"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="shad-form_label">Banner Color</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="color"
                                                        {...field}
                                                        className="w-12 h-10 cursor-pointer"
                                                        onChange={(e) => {
                                                            field.onChange(e.target.value);
                                                            setColor(e.target.value);
                                                        }}
                                                    />
                                                    <Input
                                                        type="text"
                                                        value={field.value}
                                                        onChange={(e) => {
                                                            field.onChange(e.target.value);
                                                            setColor(e.target.value);
                                                        }}
                                                        className="flex-1"
                                                        placeholder="#RRGGBB"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="shad-form_message" />
                                            <FormDescription>
                                                Choose a color for the banner background
                                            </FormDescription>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="display.image"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="shad-form_label">Banner Image</FormLabel>
                                            <FormControl>
                                                <div className="flex justify-center items-center flex-col border rounded-xl">
                                                    <div {...getDisplayImageRootProps()} className="cursor-pointer w-full">
                                                        <input {...getDisplayImageInputProps()} className="cursor-pointer" />
                                                        {!displayFileUrl ? (
                                                            <div className="flex justify-center items-center flex-col p-5 h-40">
                                                                <h3 className="text-base font-medium text-gray-700 mb-2 mt-2">Drag or Drop banner image here</h3>
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
                                                                    src={displayFileUrl}
                                                                    alt="Banner image"
                                                                    className="h-48 w-full rounded-lg object-contain bg-white p-2"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    size="icon"
                                                                    variant="destructive"
                                                                    className="absolute top-2 right-2"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleRemoveDisplayFile();
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
                                                Image to show in category banners and promotional areas
                                            </FormDescription>
                                        </FormItem>
                                    )}
                                />

                                <section className="relative flex items-center bg-[#f9d2e5] rounded-xl overflow-hidden w-full h-[150px] font-jost mt-10" style={{ backgroundColor: color }}>
                                    <div className="flex flex-col justify-center text-center w-2/3 gap-4 pl-6 md:pl-20">
                                        <h1 className="text-xl font-medium leading-snug text-purple-800">
                                            {form.watch("display.title") || "Banner Title"}
                                        </h1>
                                        <p className="text-2xl font-normal leading-relaxed text-black">
                                            {form.watch("display.subtitle") || "Banner subtitle goes here"}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-center w-[45%] h-full">
                                        {displayFileUrl && (
                                            <img
                                                src={displayFileUrl}
                                                alt="Camera Banner"
                                                className="h-full object-cover"
                                            />
                                        )}
                                    </div>
                                </section>
                            </TabsContent>
                        </Tabs>
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
                                    setDisplayFile(null);
                                    setDisplayFileUrl(undefined);
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