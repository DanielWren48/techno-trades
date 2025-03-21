import { z } from "zod";
import { ProductType, ProductCreateValidation } from "@/lib/validation";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "../filters";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useUserContext } from "@/context/AuthContext";
import { toast } from "sonner";
import { useUpdateProduct } from "@/api/products/queries";

type EditProps = {
  product: ProductType;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function EditDialog({ product, setOpen }: EditProps) {
  const { user } = useUserContext();
  const { mutateAsync: updateProduct } = useUpdateProduct();

  const form = useForm<z.infer<typeof ProductCreateValidation>>({
    resolver: zodResolver(ProductCreateValidation),
    defaultValues: {
      name: product.name,
      image: product.image,
      brand: product.brand,
      category: product.category,
      description: product.description,
      price: product.price,
      countInStock: product.countInStock,
      discountedPrice: product.discountedPrice,
      isDiscounted: product.isDiscounted,
    },
  });

  const handleSubmit = async (value: z.infer<typeof ProductCreateValidation>) => {
    const { message, status } = await updateProduct({
      id: product._id!,
      ...value,
    })
    if (status === "success") {
      toast.success(message)
      setOpen?.(false);
    }
    if (status === "failure") {
      toast.error(message)
    }
  }

  return (
    <div>
      <DialogHeader>
        <DialogTitle>Edit Product Details</DialogTitle>
      </DialogHeader>

      <div className="py-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-6 w-full max-w-5xl"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-8">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="shad-form_label">Brand</FormLabel>
                    <FormControl>
                      <Input type="text" className="h-12" {...field} />
                    </FormControl>
                    <FormMessage className="shad-form_message" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="shad-form_label">Category</FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select a Category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {categories.map((status, index) => (
                            <SelectItem key={index} value={status.value}>
                              <span className="flex items-center">
                                <status.icon className="mr-2 h-5 w-5 text-muted-foreground" />
                                {status.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage className="shad-form_message" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-8">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="shad-form_label">Price</FormLabel>
                    <FormControl>
                      <Input type="number" className="h-12" {...field} />
                    </FormControl>
                    <FormMessage className="shad-form_message" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="countInStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="shad-form_label">Stock</FormLabel>
                    <FormControl>
                      <Input type="number" className="h-12" {...field} />
                    </FormControl>
                    <FormMessage className="shad-form_message" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="min-h-[200px] max-h-[400px] rounded-xl focus-visible:ring-1 focus-visible:ring-offset-1"
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />
            <Button type="submit" className="mt-2 w-full">
              Update Details
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
