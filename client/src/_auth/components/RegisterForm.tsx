import { AuthButton } from "./AuthButton";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { useRegisterUser } from "@/api/auth/queries";
import { zodResolver } from "@hookform/resolvers/zod";
import { Fragment, useEffect, useState } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { registerSchema, RegisterValidationType } from "../schemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface RegisterProps {
  setActiveTab: React.Dispatch<React.SetStateAction<string>>
  setUserData: React.Dispatch<React.SetStateAction<RegisterValidationType | undefined>>
  triggerErrorAnimation?: () => void
}

export default function RegisterForm({ setActiveTab, setUserData, triggerErrorAnimation }: RegisterProps) {
  const [error, setError] = useState<{ status: string, message: string, code: string | undefined } | undefined>();
  const [type, setType] = useState<'password' | 'text'>('password');
  const { mutateAsync: createAccount, isPending: loadingUser } = useRegisterUser();
  const form = useForm<RegisterValidationType>({ resolver: zodResolver(registerSchema) })
  const { errors, isSubmitting } = form.formState;
  const handleToggle = () => { setType(type === 'password' ? 'text' : 'password') };

  useEffect(() => {
    form.setFocus('firstName')
    if (Object.keys(errors).length > 0 && !isSubmitting) {
      triggerErrorAnimation && triggerErrorAnimation();
    }
  }, [errors, isSubmitting]);

  async function onSubmit(user: RegisterValidationType) {
    const { message, status, data, code } = await createAccount(user);
    if (status === 'success' && data) {
      setActiveTab('otp')
      setUserData(user)
    } else {
      setError({ status, message, code })
    }
  };

  return (
    <Fragment>
      {error &&
        <div className="flex items-center p-4 mb-4 text-sm text-blue-800 border border-blue-300 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800" role="alert">
          <AlertCircle className="w-6 h-6 mr-2" />
          <span className="sr-only">Info</span>
          <div className="text-base">
            <span className="font-medium">{error.message}</span>
          </div>
        </div>
      }
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-5 w-full font-jost"
        >
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block mb-2 text-sm font-medium text-gray-600 dark:text-gra-200">First Name<span className="text-red-500 ml-1">*</span></FormLabel>
                <FormControl>
                  <Input type="text" placeholder="John" className="block w-full px-4 py-2 h-12"   {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200">Last Name<span className="text-red-500 ml-1">*</span></FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Doe" className="block w-full px-4 py-2 h-12"{...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200">Email Address<span className="text-red-500 ml-1">*</span></FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="new-password" placeholder="john.doe@email.com" className="block w-full px-4 py-2 h-12" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-200">Password<span className="text-red-500 ml-1">*</span></FormLabel>
                <div className="relative">
                  <FormControl className="flex-grow pr-10">
                    <Input type={type} autoComplete="new-password" maxLength={50} placeholder="Password" className="block w-full px-4 py-2 h-12" {...field} />
                  </FormControl>
                  <span className="absolute right-0 top-0 cursor-pointer bg-accent p-[11px] rounded-r-md border" onClick={handleToggle}>
                    {type === 'password' ? <Eye /> : <EyeOff />}
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <AuthButton type="submit" disabled={loadingUser} isPending={loadingUser} size={"lg"} text={"Register"} className="mt-6" />
        </form>
      </Form>
    </Fragment>
  )
};