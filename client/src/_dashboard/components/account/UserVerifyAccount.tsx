import {
    Form,
    FormControl,
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
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserContext } from "@/context/AuthContext";
import { AuthButton } from "@/_auth/components/AuthButton";
import { useResendVerificationEmail, useVerifyAccountUser } from "@/_auth/lib/queries";
import { verifyAccountScheme, VerifyAccountSchemeType } from "@/_dashboard/schemas/account";

export default function VerifyUserAccount() {
    const { user } = useUserContext();
    const { mutateAsync: verifyAccount, isPending } = useVerifyAccountUser();
    const { mutateAsync: resendVerificationEmail } = useResendVerificationEmail();

    const form = useForm<VerifyAccountSchemeType>({
        resolver: zodResolver(verifyAccountScheme),
        defaultValues: {
            email: user.email,
            otp: undefined,
        },
    });

    const { errors, isSubmitting } = form.formState;

    useEffect(() => {
        form.setFocus('otp')
    }, [errors, isSubmitting]);

    async function requestNewCode() {
        const { message } = await resendVerificationEmail({ email: user.email })
        toast.info(message)
    }

    const handleUpdate = async (value: VerifyAccountSchemeType) => {
        const { message, status, data } = await verifyAccount({
            email: value.email,
            otp: +value.otp,
        });
        if (status === 'failure') {
            form.setError("otp", { message })
            form.setFocus('otp')
        }else if (data && status === "success"){
            toast.success(message)
            window.location.reload();
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleUpdate)}
                className="flex flex-col gap-5 w-full mt-4 max-w-5xl"
            >
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="shad-form_label">Email</FormLabel>
                            <FormControl>
                                <Input type="email" className="h-12" {...field} disabled />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200">One Time Password</FormLabel>
                            <FormControl>
                                <InputOTP
                                    maxLength={6}
                                    pattern={REGEXP_ONLY_DIGITS}
                                    containerClassName="group flex items-center justify-start has-[:disabled]:opacity-30 my-5"
                                    render={({ slots }) => (
                                        <>
                                            <InputOTPGroup>
                                                {slots.slice(0, 3).map((slot, index) => (
                                                    <InputOTPSlot key={index} {...slot} className="w-[67px] h-[67px] bg-white" />
                                                ))}{" "}
                                            </InputOTPGroup>
                                            <InputOTPDash />
                                            <InputOTPGroup>
                                                {slots.slice(3).map((slot, index) => (
                                                    <InputOTPSlot key={index + 3} {...slot} className="w-[67px] h-[67px] bg-white" />
                                                ))}
                                            </InputOTPGroup>
                                        </>
                                    )}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="p-4 text-blue-800 border border-blue-300 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800" role="alert">
                    <div className="mt-2 mb-4 text-sm">
                        We emailed you an eight-digit code to{" "}
                        <span className="font-bold text-base">{form.getValues('email')}</span>.
                        <br />
                        Enter the code you recieved to confirm the email address change on your account.
                        <br />
                        If you did not recieve your code, please check your <span className="italic font-medium">Spam Folder</span> before requesting a new one!
                    </div>
                    <Button type="button" onClick={() => requestNewCode()} className="bg-blue-800">
                        Resend
                    </Button>
                </div>

                <AuthButton
                    type="submit"
                    disabled={isPending || isSubmitting}
                    isPending={isPending || isSubmitting}
                    size={"lg"}
                    text={"Verify Account"}
                />
            </form>
        </Form>
    );
};