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
    InputOTPGroup,
    InputOTPDash,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useVerifyAccountUser } from "@/api/auth/queries";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Fragment, useEffect } from "react";
import { RegisterValidationType, OtpSchemaType, otpSchema } from "../schemas";
import { AuthButton } from "./AuthButton";

interface VerifyAccountFormProps {
    userData: RegisterValidationType | undefined
    activeTab: string
    setActiveTab: React.Dispatch<React.SetStateAction<string>>
    triggerErrorAnimation?: () => void
}

export default function VerifyAccountForm({ userData, activeTab, setActiveTab, triggerErrorAnimation }: VerifyAccountFormProps) {
    const { mutateAsync: verifyAccount, isPending } = useVerifyAccountUser();
    const form = useForm<OtpSchemaType>({ resolver: zodResolver(otpSchema) })
    const { errors, isSubmitting } = form.formState;

    useEffect(() => {
        form.setFocus('otp')
        if (Object.keys(errors).length > 0 && !isSubmitting) {
            triggerErrorAnimation && triggerErrorAnimation();
        }
    }, [errors, isSubmitting]);

    async function onSubmit(data: OtpSchemaType) {
        const { message, status } = await verifyAccount({ otp: +data.otp, email: userData!.email });
        if (status === 'failure') {
            form.setError("otp", { message })
            form.setFocus('otp')
        }
        if (status === 'success' && message === 'Email already verified') {
            toast.info(message);
        }
        if (status === 'success' && message === 'Verification successful') {
            setActiveTab('confirm')
        }
    }

    return (
        <Fragment>
            {(activeTab === 'otp') && (
                <div className="flex items-center p-4 mb-4 text-sm text-blue-800 border border-blue-300 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800" role="alert">
                    <AlertCircle className="w-6 h-6 mr-2" />
                    <span className="sr-only">Info</span>
                    <div className="text-base">
                        We have sent a{" "}
                        <span className="italic font-medium">One Time Password</span>{" "}
                        to {userData?.email}.
                    </div>
                </div>
            )}
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-8 w-full mt-4"
                >
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
                                        containerClassName="group flex items-center justify-center has-[:disabled]:opacity-30 my-5"
                                        render={({ slots }) => (
                                            <>
                                                <InputOTPGroup>
                                                    {slots.slice(0, 3).map((slot, index) => (
                                                        <InputOTPSlot key={index} {...slot} className="w-[67px] h-[67px]" />
                                                    ))}{" "}
                                                </InputOTPGroup>
                                                <InputOTPDash />
                                                <InputOTPGroup>
                                                    {slots.slice(3).map((slot, index) => (
                                                        <InputOTPSlot key={index + 3} {...slot} className="w-[67px] h-[67px]" />
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
                    <AuthButton
                        type="submit"
                        disabled={isPending || isSubmitting}
                        isPending={isPending || isSubmitting}
                        size={"lg"}
                        className="my-2"
                        text={"Verify Account"}
                    />
                </form>
            </Form>
        </Fragment>
    );
};
