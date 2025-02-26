import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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
import { useUpdateUserPassword, useUpdateUserProfile } from "@/api/users/queries";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { passwordUpdateSchema, PasswordUpdateSchemaType } from "@/_dashboard/schemas/account";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function UpdateUserPassword() {

    const { mutateAsync: updatePassword, isPending } = useUpdateUserPassword()

    const [passwordVisibility, setPasswordVisibility] = useState({
        passwordCurrent: false,
        password: false,
        passwordConfirm: false
    });

    const handleToggle = (field: keyof typeof passwordVisibility) => {
        setPasswordVisibility(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const form = useForm<PasswordUpdateSchemaType>({
        resolver: zodResolver(passwordUpdateSchema),
        defaultValues: {
            passwordCurrent: "",
            password: "",
            passwordConfirm: "",
        },
    });

    const handleUpdate = async (value: PasswordUpdateSchemaType) => {
        const response = await updatePassword(value)
        const { data, status, message } = response
        if (data && status === "success") {
            toast.success(message);
        } else {
            toast.error(message);
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
                    name="passwordCurrent"
                    render={({ field }) => (
                        <FormItem>
                            <div className="relative">
                                <FormControl className="flex-grow pr-10">
                                    <Input
                                        autoComplete="new-password"
                                        type={passwordVisibility.passwordCurrent ? 'text' : 'password'}
                                        maxLength={35}
                                        placeholder="Current Password"
                                        className="block w-full px-4 py-2 h-12"
                                        {...field}
                                    />
                                </FormControl>
                                <span
                                    className="absolute right-3 top-3 cursor-pointer"
                                    onClick={() => handleToggle('passwordCurrent')}
                                >
                                    {passwordVisibility.passwordCurrent ? <EyeOff /> : <Eye />}
                                </span>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <div className="relative">
                                <FormControl className="flex-grow pr-10">
                                    <Input
                                        autoComplete="new-password"
                                        type={passwordVisibility.password ? 'text' : 'password'}
                                        maxLength={35}
                                        placeholder="New Password"
                                        className="block w-full px-4 py-2 h-12"
                                        {...field}
                                    />
                                </FormControl>
                                <span
                                    className="absolute right-3 top-3 cursor-pointer"
                                    onClick={() => handleToggle('password')}
                                >
                                    {passwordVisibility.password ? <EyeOff /> : <Eye />}
                                </span>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="passwordConfirm"
                    render={({ field }) => (
                        <FormItem>
                            <div className="relative">
                                <FormControl className="flex-grow pr-10">
                                    <Input
                                        autoComplete="new-password"
                                        type={passwordVisibility.passwordConfirm ? 'text' : 'password'}
                                        maxLength={35}
                                        placeholder="Confirm New Password"
                                        className="block w-full px-4 py-2 h-12"
                                        {...field}
                                    />
                                </FormControl>
                                <span
                                    className="absolute right-3 top-3 cursor-pointer"
                                    onClick={() => handleToggle('passwordConfirm')}
                                >
                                    {passwordVisibility.passwordConfirm ? <EyeOff /> : <Eye />}
                                </span>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={isPending}>
                    {isPending ? (
                        <>
                            <Loader2 className="animate-spin h-5 w-5 mr-3" />
                            Updating...
                        </>
                    ) : (
                        <>Reset Password</>
                    )}
                </Button>
            </form>
        </Form>
    );
}