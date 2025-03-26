import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    InputOTP,
    InputOTPDash,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserContext } from "@/context/AuthContext";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp"
import { useSendEmailChangeOtp, useUpdateUserEmail } from "@/api/users/queries";
import { emailUpdateSchema, EmailUpdateSchemaType } from "@/_dashboard/schemas/account";

export default function UpdateUserEmail() {
    const { user } = useUserContext();
    const [showOTPField, setShowOTPField] = useState(false);
    const { mutateAsync: sendEmailChangeOtp } = useSendEmailChangeOtp()
    const { mutateAsync: updateUserEmail, isPending: userEmailUpdateLoading } = useUpdateUserEmail()

    const form = useForm<EmailUpdateSchemaType>({
        resolver: zodResolver(emailUpdateSchema),
        defaultValues: {
            currentEmail: user.email,
            newEmail: "",
            otp: "",
        },
    });

    const { formState: { isDirty, isSubmitting, isValid }, getValues } = form

    const handleNewEmailChange = (newEmail: string) => {
        form.clearErrors("newEmail")
        form.setValue('newEmail', newEmail);
        if (newEmail.trim() === '') {
            setShowOTPField(false);
        }
    };

    const requestValidationCode = async () => {
        const isValidEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
        const email = form.getValues('newEmail');
        if (email.trim() !== '' && email.match(isValidEmail)) {
            const { data, message, status } = await sendEmailChangeOtp()
            if (data && status === "success") {
                toast.success(message);
                form.setFocus("otp")
                setShowOTPField(true);
            } else {
                toast.error(message);
            }
        } else {
            form.setError("newEmail", {
                type: "manual",
                message: "Please enter valid email address",
            })
        }
    };

    const handleUpdate = async (value: EmailUpdateSchemaType) => {
        console.log({ value })
        const response = await updateUserEmail({
            email: value.newEmail,
            otp: +value.otp,
        })
        const { data, status, message } = response
        if (data && status === "success") {
            toast.success(message);
            form.reset()
            setShowOTPField(false);
            form.setValue("currentEmail", data.email)
        } else {
            toast.error(message);
            form.setError("otp", { message: message }, { shouldFocus: true })
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
                    name="currentEmail"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Current Email</FormLabel>
                            <FormControl>
                                <Input type="email" className="h-12" {...field} disabled />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="newEmail"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">New Email</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    className="h-12"
                                    {...field}
                                    disabled={showOTPField}
                                    onChange={(e) => handleNewEmailChange(e.target.value)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className={`transition-all duration-500 overflow-hidden ${showOTPField ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0'}`}>
                    <FormField
                        control={form.control}
                        name="otp"
                        render={({ field }) => (
                            <FormItem className="overflow-hidden pl-1">
                                <FormLabel className="shad-form_label">Email Verification Code</FormLabel>
                                <FormControl>
                                    <InputOTP
                                        autoFocus
                                        maxLength={6}
                                        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                                        render={({ slots }) => (
                                            <>
                                                <InputOTPGroup>
                                                    {slots.slice(0, 3).map((slot, index) => (
                                                        <InputOTPSlot key={index} {...slot} className="h-12 w-12" />
                                                    ))}{" "}
                                                </InputOTPGroup>
                                                <InputOTPDash />
                                                <InputOTPGroup>
                                                    {slots.slice(3).map((slot, index) => (
                                                        <InputOTPSlot key={index + 5} {...slot} className="h-12 w-12" />
                                                    ))}
                                                </InputOTPGroup>
                                            </>
                                        )}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                                {(user && showOTPField) && (
                                    <>
                                        <FormDescription className="py-2">
                                            We emailed you an eight-digit code to{" "}
                                            <span className="font-bold text-base">{form.getValues('newEmail')}</span>.
                                            Enter the code you recieved to confirm the email address change on your account.
                                        </FormDescription>
                                        <div className="flex flex-col space-y-5 w-full mt-5">
                                            <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
                                                <p>Didn't recieve code?</p>
                                                <Button
                                                    type="button"
                                                    variant={"link"}
                                                    className="flex flex-row items-center text-blue-600 p-0"
                                                >
                                                    Resend
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </FormItem>
                        )}
                    />
                </div>

                {!showOTPField && <Button type="button" className="max-w-xs" onClick={requestValidationCode}>
                    Request Validation Code
                </Button>
                }

                {showOTPField && <Button type="submit" className="max-w-xs" disabled={userEmailUpdateLoading || !isValid}>
                    {userEmailUpdateLoading ? (
                        <>
                            <Loader2 className="animate-spin h-5 w-5 mr-3" />
                            Uploading...
                        </>
                    ) : (
                        <>Update Email</>
                    )}
                </Button>
                }
            </form>
        </Form>
    );
};
