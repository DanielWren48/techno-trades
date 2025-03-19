import * as z from "zod";
import { toast } from "sonner";
import { Product } from "@/types";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import "@smastrom/react-rating/style.css";
import { Textarea } from "../ui/textarea";
import { useForm } from "react-hook-form";
import { ratingStyle } from "@/lib/utils";
import { Rating } from "@smastrom/react-rating";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserContext } from "@/context/AuthContext";
import { ProductReviewValidation } from "@/lib/validation";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/form";

type ReviewFormProps = {
  product: Product;
};

const ProductReviewForm = ({ product }: ReviewFormProps) => {
  const { isAuthenticated } = useUserContext();
  // const { mutateAsync: CreateReview } = useCreateReview()

  const form = useForm<z.infer<typeof ProductReviewValidation>>({
    resolver: zodResolver(ProductReviewValidation),
    defaultValues: {
      rating: 0,
      title: "",
      comment: "",
    },
  });

  const handleSubmit = async (value: z.infer<typeof ProductReviewValidation>) => {
    // if (isAuthenticated) {
    //   const res = await CreateReview({
    //     productId: product._id!,
    //     rating: value.rating,
    //     title: value.title,
    //     comment: value.comment
    //   })
    //   if (res && (res.status === 201 && res.statusText === "Created")) {
    //     form.reset()
    //     toast.success('Success', {
    //       description: "Review Published",
    //       duration: 4000,
    //     })
    //   } else {
    //     toast.error('Oops, Someone Fucked Up', {
    //       description: "Error Creating Reivew",
    //       duration: 4000,
    //     })
    //   }
    // }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-3 max-w-wull"
      >
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <Rating
                itemStyles={ratingStyle}
                style={{ maxWidth: 150 }}
                {...field}
              />
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="text" className="focus-visible:ring-1 focus-visible:ring-offset-1 ring-offset-light-4" placeholder="Review Title" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea className="h-36 p-4 rounded-xl focus-visible:ring-1 focus-visible:ring-offset-1 ring-offset-light-4" placeholder="Review comment" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <Button type="submit" className="max-w-[15rem] text-lg font-medium" disabled={!isAuthenticated}>
          Post
        </Button>
      </form>
    </Form>
  );
};

export default ProductReviewForm;
