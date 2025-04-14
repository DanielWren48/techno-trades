import { useSignInWithOtp } from "@/api/queries/auth";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPDash,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { AlertTriangleIcon } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { UserEmailSchemaType, otpSchema, OtpSchemaType } from "../schemas";
import { AuthButton } from "./AuthButton";

interface SigninWithOtpProps {
    showOTPField: boolean
    userData: UserEmailSchemaType
    triggerErrorAnimation?: () => void
}

export default function SignInWithOtp({ showOTPField, userData, triggerErrorAnimation }: SigninWithOtpProps) {
    const [error, setError] = useState<string | undefined>();
    const { mutateAsync: signInWithOtp, isPending } = useSignInWithOtp()
    const form = useForm<OtpSchemaType>({ resolver: zodResolver(otpSchema) });
    const { errors, isSubmitting } = form.formState;

    useEffect(() => {
        form.setFocus('otp')
        if (Object.keys(errors).length > 0 && !isSubmitting) {
            triggerErrorAnimation && triggerErrorAnimation();
        }
    }, [errors, isSubmitting]);

    async function onSubmit(data: OtpSchemaType) {
        const { message, status } = await signInWithOtp({
            otp: +data.otp,
            email: userData.email
        });
        if (status === 'failure') {
            triggerErrorAnimation && triggerErrorAnimation()
            form.resetField('otp')
            form.setFocus('otp')
            setError(message)
        }
    }

    return (
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
                            {error &&
                                <div className="flex items-center text-sm text-red-600" role="alert">
                                    <AlertTriangleIcon className="w-5 h-5 mr-2" />
                                    <span className="sr-only">Info</span>
                                    <span>{error}</span>
                                </div>
                            }
                            {(showOTPField && !error) && (
                                <Fragment>
                                    <FormDescription className="py-2">
                                        We emailed a six-digit code to{" "}
                                        <span className="font-bold text-base">{userData?.email}</span>.
                                    </FormDescription>
                                </Fragment>
                            )}
                        </FormItem>
                    )}
                />

                <AuthButton type="submit" disabled={isPending || isSubmitting} isPending={isPending || isSubmitting} size={"lg"} text={"Sign in"} />
            </form>
        </Form>
    );
}