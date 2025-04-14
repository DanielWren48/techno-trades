import { toast } from "sonner";
import { useForm } from "react-hook-form"
import { AuthButton } from "./AuthButton";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { AlertTriangleIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod"
import { useSendPasswordResetOtp } from "@/api/queries/auth";
import { userEmailSchema, UserEmailSchemaType } from "../schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

interface SendPasswordResetOtpFormProps {
    activeTab: string
    setActiveTab: React.Dispatch<React.SetStateAction<string>>
    setUserData: React.Dispatch<React.SetStateAction<UserEmailSchemaType | undefined>>
    triggerErrorAnimation?: () => void
}

export default function SendPasswordResetOtpForm({ activeTab, setActiveTab, setUserData, triggerErrorAnimation }: SendPasswordResetOtpFormProps) {
    const disableField = activeTab === 'password'
    const [error, setError] = useState<string | undefined>();
    const { mutateAsync: sendPasswordResetOtp, isPending } = useSendPasswordResetOtp()
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
        const email = form.getValues('email');
        if (email.trim() !== '' && email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)) {
            const { message, status } = await sendPasswordResetOtp({ email: email })
            if (status === 'success') {
                toast.info(message)
                setUserData(data)
                setActiveTab('password')
            }
            if (status === 'failure') {
                setError(message)
                form.setFocus('email')
            }
        } else {
            form.setError("email", {
                type: "manual",
                message: "Please enter valid email address",
            })
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col gap-5 w-full font-jost"
            >
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200">Email</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder="john.doe@email.com"
                                    className="block w-full px-4 py-2 h-12"
                                    {...field}
                                    disabled={disableField}
                                    onChange={(e) => handleNewEmailChange(e.target.value)}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {error &&
                    <div className="flex items-center text-sm text-red-600" role="alert">
                        <AlertTriangleIcon className="w-5 h-5 mr-2" />
                        <span className="sr-only">Info</span>
                        <span>{error}</span>
                    </div>
                }
                <AuthButton
                    type="submit"
                    disabled={isPending || isSubmitting || disableField}
                    isPending={isPending || isSubmitting}
                    size={"lg"}
                    text={"Continue"}
                />
            </form>
        </Form>
    );
}