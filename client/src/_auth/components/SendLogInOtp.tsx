import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSendLoginOtp } from "@/api/auth/queries";
import { AlertTriangleIcon, Forward } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { userEmailSchema, UserEmailSchemaType } from "../schemas";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface SendOtpProps {
    showOTPField: boolean
    setShowOTPField: React.Dispatch<React.SetStateAction<boolean>>
    setUserData: React.Dispatch<React.SetStateAction<UserEmailSchemaType | undefined>>
    triggerErrorAnimation?: () => void
}

export default function SendLogInOtp({ showOTPField, setShowOTPField, setUserData, triggerErrorAnimation }: SendOtpProps) {
    const [error, setError] = useState<{ status: string, message: string, code: string | undefined } | undefined>();
    const { mutateAsync: sendLoginOtp } = useSendLoginOtp()
    const form = useForm<UserEmailSchemaType>({ resolver: zodResolver(userEmailSchema) });
    const { errors, isSubmitting } = form.formState;

    useEffect(() => {
        form.setFocus('email')
        if (Object.keys(errors).length > 0 && !isSubmitting) {
            triggerErrorAnimation && triggerErrorAnimation();
        }
    }, [errors, isSubmitting]);

    const handleNewEmailChange = (newEmail: string) => {
        form.clearErrors("email")
        form.setValue('email', newEmail);
        setError(undefined)
    };

    async function onSubmit(data: UserEmailSchemaType) {
        const { message, status, code } = await sendLoginOtp({ email: data.email })
        if (status === 'failure') {
            triggerErrorAnimation && triggerErrorAnimation();
            setError({ status, message, code })
            form.setFocus("email")
        }
        if (status === 'success') {
            form.reset()
            toast.info(message)
            setShowOTPField(true);
            setUserData(data)
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col items-center sm:flex-row my-5"
            >
                <div className="flex flex-col w-full sm:mr-2">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel className="block text-sm font-medium text-gray-600 dark:text-gray-200">Email Address<span className="text-red-500 ml-1">*</span></FormLabel>
                                <div className="flex gap-2">
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="john.doe@email.com"
                                            className="block w-full px-4 py-2 h-12"
                                            {...field}
                                            disabled={showOTPField}
                                            onChange={(e) => handleNewEmailChange(e.target.value)}
                                        />
                                    </FormControl>
                                    <Button
                                        disabled={showOTPField}
                                        type="submit"
                                        variant={"outline"}
                                        className="flex-shrink-0 h-12"
                                    >
                                        <Forward className="h-6 w-6 text-dark-4" />
                                    </Button>
                                </div>
                                <FormMessage />
                                {error &&
                                    <div className="flex items-center text-sm text-red-600" role="alert">
                                        <AlertTriangleIcon className="w-5 h-5 mr-2" />
                                        <span className="sr-only">Info</span>
                                        <span>{error.message}</span>
                                    </div>
                                }
                                {/* {(!showOTPField && !error) && (
                                    <FormDescription className="max-w-sm">
                                        We will email you a{" "}
                                        <span className="italic font-medium">One Time Password</span> to Sign
                                        in to your account!
                                    </FormDescription>
                                )} */}
                            </FormItem>
                        )}
                    />
                </div>
            </form>
        </Form>
    );
}