import { z } from "zod";
import { OrderType } from "@/lib/validation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deliveryStatuses } from "../filters";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useUpdateShippingStatus } from "@/api/orders/queries";

type EditProps = {
  order: OrderType;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const deliveryStatusSchema = z.object({
  _id: z.string(),
  deliveryStatus: z.enum(["pending", "shipped", "delivered"]),
});

export default function ShippingStatusDialog({ order, setOpen }: EditProps) {

  const { mutateAsync: updateStatus, isError } = useUpdateShippingStatus()

  const form = useForm<z.infer<typeof deliveryStatusSchema>>({
    resolver: zodResolver(deliveryStatusSchema),
    defaultValues: {
      _id: order._id,
      deliveryStatus: order.deliveryStatus
    },
  });

  const handleSubmit = async (value: z.infer<typeof deliveryStatusSchema>) => {
    const { status, message } = await updateStatus({ orderId: value._id, status: value.deliveryStatus });
    if (status === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
    setOpen(false)
  };

  return (
    <div>
      <DialogHeader>
        <DialogTitle>Edit Order Shipping Status</DialogTitle>
      </DialogHeader>

      <div className="py-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid gap-3"
          >
            <FormField
              control={form.control}
              name="deliveryStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Status to Update" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        {deliveryStatuses.map((status, index) => (
                          <SelectItem key={index} value={status.value}>
                            <span className="flex items-center">
                              {status.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="mt-2 w-full">
              Update Status
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
