import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useCallback, useState } from "react";
import { convertFileToUrl } from "@/lib/utils";
import { useUploadThing } from "@/uploadthing";
import { Button } from "@/components/ui/button";
import { FileWithPath } from "@uploadthing/react";
import { Progress } from "@/components/ui/progress"
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserContext } from "@/context/AuthContext";
import { useDropzone } from "@uploadthing/react/hooks";
import { useUpdateUserProfile } from "@/api/users/queries";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AccountUpdateSchemaType, accountUpdateSchema } from "@/_dashboard/schemas/account";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { medaiApi } from "@/api/media/requests";
import { Icons } from "@/components/shared";
import { mediaApiEndpoints } from "@/api/client";

export default function UpdateProfile() {
    const { user } = useUserContext();
    const [file, setFile] = useState<FileWithPath[]>([]);
    const [fileUrl, setFileUrl] = useState<string | undefined>(user.avatar);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const { mutateAsync, isPending } = useUpdateUserProfile()

    const form = useForm<AccountUpdateSchemaType>({
        resolver: zodResolver(accountUpdateSchema),
        defaultValues: {
            firstName: user.firstName,
            lastname: user.lastName,
            avatar: user.avatar,
        },
    });

    const { formState: { isDirty, isSubmitting, isValid }, getValues } = form

    const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
        const newFile = [...acceptedFiles];
        const newFileUrls = newFile.map(convertFileToUrl);

        setFile(newFile);
        setFileUrl(newFileUrls[0]);

        if (!user.avatar) {
            form.setValue("avatar", newFileUrls[0])
        }
    }, [file]);

    const { startUpload, isUploading, permittedFileInfo } = useUploadThing("videoAndImage", {
        onClientUploadComplete: () => {
            toast.success("Uploaded images successfully!", {
                id: "uploading",
            });
        },
        onUploadError: (error: Error) => {
            toast.error(error.message, {
                id: "uploading",
            });
        },
        onUploadBegin: () => {
            toast.loading("Uploading images...", {
                id: "uploading",
            });
        },
        onUploadProgress: (progress: number) => setUploadProgress(progress),
    });

    const fileTypes = permittedFileInfo?.config ? Object.keys(permittedFileInfo?.config) : [];

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: fileTypes ? generateClientDropzoneAccept(fileTypes) : undefined,
        maxFiles: 1
    });

    const removeAvatar = () => {
        setFile([]);
        setFileUrl(undefined);
        // Set to null to indicate avatar removal
        form.setValue("avatar", null);
    }

    const handleUpdate = async (value: AccountUpdateSchemaType) => {
        let newAvatar: string | null | undefined = user.avatar;

        // Determine if avatar is actually changing
        const isAvatarChanging =
            file.length > 0 ||  // New file selected
            value.avatar === null ||  // Explicitly removing avatar
            value.avatar !== user.avatar;  // Different avatar URL

        // Only process avatar if it's changing
        if (isAvatarChanging) {
            // Delete existing avatar if it exists
            if (user.avatar) {
                const avatar_key = user.avatar.split("/").at(-1);
                if (avatar_key) {
                    try {
                        toast.promise(() => mediaApiEndpoints.deleteFiles([avatar_key]),
                            {
                                loading: 'Removing file...',
                                success: () => 'File deleted succesfully',
                                error: () => 'Error deleting files.',
                            }
                        );
                        // const { message } = await mediaApiEndpoints.deleteFiles([avatar_key]);
                        // toast.info(message);
                    } catch (error) {
                        toast.error('Failed to delete existing avatar');
                    }
                }
            }

            // Handle new file upload
            if (file.length > 0) {
                const uploadFileResponse = await startUpload(file);
                if (uploadFileResponse) {
                    newAvatar = uploadFileResponse[0].url;
                } else {
                    toast.error('File upload error. Please try again!');
                    return;
                }
            }
            // Explicitly handle avatar removal
            else if (value.avatar === null) {
                newAvatar = null;
            }
        }

        const response = await mutateAsync({
            firstName: value.firstName,
            lastName: value.lastname,
            avatar: isAvatarChanging ? newAvatar : undefined, // Only send avatar if it's changing
        });

        if (response.status === "success" && response.data) {
            toast.success(response.message);
        } else {
            toast.error(response.message);
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleUpdate)}
                className="flex flex-col gap-5 w-full mt-4 max-w-5xl"
            >
                <FormField
                    control={form.control}
                    name="avatar"
                    render={({ field }) => (
                        <FormItem className="flex">
                            <FormControl>
                                <div {...getRootProps()}>
                                    <input {...getInputProps()} className="cursor-pointer" />
                                    <div className="cursor-pointer flex-center gap-4 flex flex-row items-center relative">
                                        <div className="relative">
                                            <Avatar className="h-28 w-28 border-4">
                                                <AvatarImage
                                                    src={fileUrl}
                                                    alt={user.email}
                                                    className="object-cover"
                                                />
                                                <AvatarFallback className="text-3xl font-semibold">
                                                    {user.firstName.slice(0, 1)}{user.lastName.slice(0, 1)}
                                                </AvatarFallback>
                                            </Avatar>
                                            {fileUrl && (
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={removeAvatar}
                                                    className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-6 h-6 rounded-full p-1"
                                                >
                                                    <Icons.X className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                        <p className="small-regular md:base-semibold text-dark-4 dark:text-muted-foreground">
                                            Change profile photo
                                        </p>
                                    </div>
                                </div>
                            </FormControl>
                            <FormMessage className="shad-form_message" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">First Name</FormLabel>
                            <FormControl>
                                <Input type="text" className="h-12" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="lastname"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Last Name</FormLabel>
                            <FormControl>
                                <Input type="text" className="h-12" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {isUploading && <Progress value={uploadProgress} />}
                <Button type="submit" disabled={isUploading || isPending} className="max-w-xs">
                    {(isUploading || isPending) ? (
                        <>
                            <Loader2 className="animate-spin h-5 w-5 mr-3" />
                            Uploading...
                        </>
                    ) : (
                        <>Update Profile</>
                    )}
                </Button>
            </form>
        </Form>
    );
};
