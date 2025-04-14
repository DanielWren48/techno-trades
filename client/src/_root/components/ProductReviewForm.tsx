import * as z from "zod";
import { toast } from "sonner";
import { Product } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import "@smastrom/react-rating/style.css";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { ratingStyle } from "@/lib/utils";
import { Rating } from "@smastrom/react-rating";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserContext } from "@/context/AuthContext";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateProductReview } from "@/api/queries/product";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const createReviewSchema = z.object({
    rating: z.number().min(1, { message: "Please provide a Rating" }).max(5),
    title: z.string().min(1, { message: "Please provide a Title" }).max(1000, { message: "Maximum 1000 characters." }),
    comment: z.string().max(5000, { message: "Maximum 5000 characters." }),
});
type CreateReviewSchemaType = z.infer<typeof createReviewSchema>

export default function ProductReviewForm({ product }: { product: Product }) {
    const { isAuthenticated } = useUserContext();
    const { mutateAsync, isPending } = useCreateProductReview()

    const form = useForm<CreateReviewSchemaType>({
        resolver: zodResolver(createReviewSchema),
        defaultValues: {
            rating: 0,
            title: "",
            comment: "",
        },
    });

    const { formState: { isDirty, isValid } } = form

    const handleSubmit = async (value: CreateReviewSchemaType) => {
        const { status, message } = await mutateAsync({ ...value, slug: product.slug })
        if (status === "success") {
            toast.success(message)
            form.reset()
        } else if (status === "failure") {
            toast.error(message)
        } else {
            toast.info(message)
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-medium">Submit Your Review</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}
                        className="flex flex-col gap-3 max-w-wull"
                    >
                        <FormField
                            control={form.control}
                            name="rating"
                            render={({ field }) => (
                                <FormItem className="space-y-0">
                                    <FormLabel className="ml-1">Add your Rating <span className="text-red-700">*</span></FormLabel>
                                    <Rating
                                        itemStyles={ratingStyle}
                                        style={{ maxWidth: 150 }}
                                        {...field}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="ml-1">Review Title<span className="text-red-700">*</span></FormLabel>
                                    <FormControl>
                                        <Input type="text" className="focus-visible:ring-1 focus-visible:ring-offset-1 ring-offset-light-4" placeholder="Add your title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="comment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="ml-1">Write your Review<span className="text-red-700">*</span></FormLabel>
                                    <FormControl>
                                        <Textarea className="h-24 p-4 rounded-xl focus-visible:ring-1 focus-visible:ring-offset-1 ring-offset-light-4" placeholder="Add your review comment" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="max-w-[15rem] text-lg font-medium" disabled={!isAuthenticated || isPending || !isDirty || !isValid}>
                            Submit Review
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}