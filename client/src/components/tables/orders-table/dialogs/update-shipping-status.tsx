import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
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
import { toast } from "sonner";
import { useUpdateShippingStatus } from "@/api/orders/queries";
import { Label } from "@/components/ui/label";

const deliveryStatusSchema = z.object({
  _id: z.string(),
  deliveryStatus: z.enum(["pending", "shipped", "delivered"]),
});

export type UpdateOrderDeliveryStatusType = z.infer<typeof deliveryStatusSchema>

type EditProps = {
  order: UpdateOrderDeliveryStatusType;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function UpdateOrderShippingStatus({ order, setOpen }: EditProps) {

  const { mutateAsync: updateStatus, isPending } = useUpdateShippingStatus()

  const form = useForm<UpdateOrderDeliveryStatusType>({
    resolver: zodResolver(deliveryStatusSchema),
    defaultValues: {
      _id: order._id,
      deliveryStatus: order.deliveryStatus
    },
  });

  const handleSubmit = async (value: UpdateOrderDeliveryStatusType) => {
    toast.loading("Updating order status", { id: "order-status-loading" });
    const { status, message } = await updateStatus({ orderId: value._id, status: value.deliveryStatus });
    if (status === 'success') {
      toast.success(message, { id: "order-status-loading" });
    } else {
      toast.error(message, { id: "order-status-loading" });
    }
    setOpen?.(false)
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="deliveryStatus"
          render={({ field }) => (
            <FormItem>
              <Label htmlFor={`${order._id}-shipping-status`} className="sr-only">
                Shipping Status
              </Label>
              <Select
                disabled={isPending}
                onValueChange={(val) => {
                  const parsed = deliveryStatusSchema.shape.deliveryStatus.parse(val);
                  handleSubmit({ deliveryStatus: parsed, _id: order._id });
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    {deliveryStatuses.map((status, index) => (
                      <SelectItem key={index} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
