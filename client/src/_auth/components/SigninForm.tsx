import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLoginUser } from "../lib/queries";
import { Input } from "@/components/ui/input";
import { AuthButton } from "./AuthButton";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, SignInSchemaType } from "../schemas";
import { Eye, EyeOff, AlertTriangleIcon } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface SigninFormProps {
  showPasswordReset?: boolean
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  triggerErrorAnimation?: () => void
}

export default function SignInForm({ showPasswordReset = true, setOpen, triggerErrorAnimation }: SigninFormProps) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | undefined>();
  const { mutateAsync: signInAccount, isPending } = useLoginUser();
  const [type, setType] = useState<'password' | 'text'>('password');
  const form = useForm<SignInSchemaType>({ resolver: zodResolver(signInSchema) });
  const { errors, isSubmitting } = form.formState;
  const handleToggle = () => { setType(type === 'password' ? 'text' : 'password') };

  useEffect(() => {
    form.setFocus('email')
    if (Object.keys(errors).length > 0 && !isSubmitting) {
      triggerErrorAnimation && triggerErrorAnimation();
    }
  }, [errors, isSubmitting]);

  const handleSignin = async (user: SignInSchemaType) => {
    // await new Promise((resolve) => setTimeout(resolve, 3000));
    const { message, status, data } = await signInAccount(user);
    if (status === "failure") {
      triggerErrorAnimation && triggerErrorAnimation()
      setError(message)
    } else if (status === "success") {
      setOpen && setOpen(false)
      if (!data?.user.isEmailVerified) {
        navigate(`/dashboard/account/${data?.user._id}`)
      } else {
        navigate("/")
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSignin)} className="flex flex-col gap-5 w-full font-jost">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="block text-sm font-medium text-gray-600 dark:text-gray-200">Email Address</FormLabel>
              <FormControl>
                <Input autoComplete="new-password" type="email" placeholder="john.doe@email.com" className="block w-full px-4 py-2 h-12" {...field} onFocus={() => setError(undefined)} />
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
              <div className="flex flex-row justify-between">
                <FormLabel className="block text-sm font-medium text-gray-600 dark:text-gray-200">Password</FormLabel>
                {showPasswordReset && <Link to="/auth/forgot-password" className="text-sm text-black/60 dark:text-gray-300 hover:underline">Forgot your Password?</Link>}
              </div>
              <div className="relative">
                <FormControl className="flex-grow pr-10">
                  <Input autoComplete="new-password" type={type} maxLength={35} placeholder="Password" className="block w-full px-4 py-2 h-12" {...field} onFocus={() => setError(undefined)} />
                </FormControl>
                <span className="absolute right-3 top-3 cursor-pointer" onClick={handleToggle}>
                  {type === 'password' ? <Eye /> : <EyeOff />}
                </span>
              </div>
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
        <AuthButton type="submit" disabled={isPending || isSubmitting} isPending={isPending || isSubmitting} size={"lg"} text={"Sign in"} />
      </form>
    </Form >
  )
}