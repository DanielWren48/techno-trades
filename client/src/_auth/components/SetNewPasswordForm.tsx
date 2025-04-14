import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPDash,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Fragment, useEffect, useState } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useSetNewPassword } from "@/api/queries/auth";
import { useNavigate } from "react-router-dom";
import { passwordReset, PasswordResetType, UserEmailSchemaType } from "../schemas";
import { AuthButton } from "./AuthButton";

interface SendPasswordResetOtpProps {
    activeTab: string
    userData: UserEmailSchemaType | undefined
    triggerErrorAnimation?: () => void
}

export default function SetNewPasswordForm({ activeTab, userData, triggerErrorAnimation }: SendPasswordResetOtpProps) {
    const navigate = useNavigate();
    const [type, setType] = useState<'password' | 'text'>('password');
    const { mutateAsync: setNewPassword, isPending } = useSetNewPassword()
    const form = useForm<PasswordResetType>({ resolver: zodResolver(passwordReset) })
    const { errors, isSubmitting } = form.formState;
    const handleToggle = () => { setType(type === 'password' ? 'text' : 'password') };

    useEffect(() => {
        form.setFocus('otp')
        if (Object.keys(errors).length > 0 && !isSubmitting) {
            triggerErrorAnimation && triggerErrorAnimation();
        }
    }, [errors, isSubmitting]);

    async function onSubmit(data: PasswordResetType) {
        const { message, status } = await setNewPassword({
            password: data.newPassword,
            email: userData!.email,
            otp: data.otp
        })
        if (status === 'success' && message === 'Password reset successful') {
            form.reset()
            toast.success(message)
            navigate('/auth/sign-in')
        }
        if (status === 'failure' && message === 'Otp is invalid or expired') {
            form.resetField('otp')
            form.setFocus('otp')
            form.setError("otp", { message })
        }
        if (status === 'failure') {
            toast.error(message)
        }
    }

    return (
        <Fragment>
            {(activeTab === 'password') && (
                <div className="flex items-center p-4 mb-4 text-sm text-blue-800 border border-blue-300 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800" role="alert">
                    <AlertCircle className="w-6 h-6 mr-2" />
                    <span className="sr-only">Info</span>
                    <div className="text-base">
                        We have emailed a{" "}
                        <span className="italic font-medium">One Time Password</span>{" "}
                        to {userData?.email}
                    </div>
                </div>
            )}
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-5 w-full mt-4 max-w-5xl"
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
                    <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200">New Password</FormLabel>
                                <div className="relative">
                                    <FormControl className="flex-grow pr-10">
                                        <Input
                                            type={type}
                                            maxLength={50}
                                            autoComplete="new-password"
                                            placeholder="Password"
                                            className="block w-full px-4 py-2 h-12"
                                            {...field}
                                        />
                                    </FormControl>
                                    <span className="absolute right-3 top-3 cursor-pointer" onClick={handleToggle}>
                                        {type === 'password' ? <Eye /> : <EyeOff />}
                                    </span>
                                </div>
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
                        text={"Reset Password"}
                    />
                </form>
            </Form >
        </Fragment>
    );
}
