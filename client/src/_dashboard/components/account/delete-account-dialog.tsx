import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCloseUserAccount } from "@/api/users/queries";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

interface AddressDialogProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function DeleteAccountDialog({ setOpen }: AddressDialogProps) {
  const navigate = useNavigate();
  const { mutateAsync: closeUserAccount } = useCloseUserAccount()

  const [type, setType] = useState<'password' | 'text'>('password');
  const handleToggle = () => { setType(type === 'password' ? 'text' : 'password') };

  const DeactivateAccountValidation = z.object({
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  });

  const form = useForm<z.infer<typeof DeactivateAccountValidation>>({
    resolver: zodResolver(DeactivateAccountValidation)
  });

  const handleCloseAccount = async () => {
    const response = await closeUserAccount()
    const { status, message } = response
    if (status === "success") {
      navigate("/");
      setOpen(false);
    } else {
      alert(message)
    }
  };

  return (
    <>
      <div className="font-semibold text-dark-4 text-lg">
        Deactivate Your Account
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleCloseAccount)}
          className="flex flex-col gap-5 w-full mt-4 space-y-5"
        >
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="relative">
                  <FormControl className="flex-grow pr-10">
                    <Input autoComplete="new-password" type={type} maxLength={35} placeholder="Enter your password" className="block w-full px-4 py-2 h-12" {...field} />
                  </FormControl>
                  <span className="absolute right-3 top-3 cursor-pointer" onClick={handleToggle}>
                    {type === 'password' ? <Eye /> : <EyeOff />}
                  </span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Confirm & Close</Button>
        </form>
      </Form>
    </>
  );
};
