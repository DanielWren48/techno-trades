import { isEmpty } from "lodash";
import { Product, Review } from "@/types";
import "@smastrom/react-rating/style.css";
import { Rating } from "@smastrom/react-rating";
import { Progress } from "@/components/ui/progress";
import { formatDate, ratingStyle } from "@/lib/utils";
import { ProductReviewForm } from "@/_root/components";
import { useUserContext } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProductReviews({ product }: { product: Product }) {
  const { isAuthenticated } = useUserContext();
  const reviews = product.reviews?.filter(value => Object.keys(value).length !== 0);

  return (
    <section className="reviews-section font-jost" id="reviews">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-8 lg:my-10">
        <Card className="flex flex-col gap-3 lg:col-span-2">
          <CardHeader className="font-medium text-3xl">Avarage Rating</CardHeader>
          <CardTitle className="flex flex-row gap-3 px-6">
            <CardDescription className="text-3xl">{product.avgRating.toFixed(1)}</CardDescription>
            <Rating
              value={product.avgRating}
              readOnly
              className="mr-2 max-w-[130px]"
              itemStyles={ratingStyle}
            />
          </CardTitle>
          <CardContent>
            {[5, 4, 3, 2, 1].map((rating) => {
              const reviewsWithThisRating = product.reviews?.filter((review: Review) => review.rating === rating).length || 0;
              const percentage = product.reviewsCount > 0 ? (reviewsWithThisRating / product.reviewsCount) * 100 : 0;
              return (
                <div key={rating} className="flex items-center mt-1">
                  <p className="pr-4 whitespace-nowrap">{rating}</p>
                  <Progress value={percentage} className="h-3 max-w-sm" />
                  <span className="pl-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
        <div className="lg:col-span-3">
          {isAuthenticated && <ProductReviewForm product={product} />}
        </div>
      </div>
      <h1 className="my-5 font-medium text-3xl">Customer Feedback</h1>
      {(!isEmpty(reviews) && reviews) ?
        <div className="flex flex-col gap-5">
          {reviews.map((review, idx) => (
            <Card key={idx} className="w-full bg-stone-200/40 border-none">
              <CardHeader>
                <div className="flex items-center my-4">
                  <Avatar className="h-14 w-14 me-2">
                    <AvatarImage
                      src={review.userAvatar}
                      alt={review.user.firstName}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gray-200">{review.userFirstName.slice(0, 1)}{review.userLastName.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2 mx-4">
                    <div className="font-semibold dark:text-white text-lg">
                      <p>{review.userFirstName} {review.userLastName}</p>
                    </div>
                    <Rating
                      value={product.avgRating}
                      readOnly
                      className="mr-2 max-w-[100px]"
                      itemStyles={ratingStyle}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 mx-20">
                <CardTitle className="capitalize">{review.title}</CardTitle>
                <p className="text-gray-500 dark:text-gray-400">{review.comment}</p>
              </CardContent>
              <CardFooter className="mx-20">
                <p>Reviewed on <span>{formatDate(review.createdAt.toString(), "year-month")}</span></p>
              </CardFooter>
            </Card>
          ))}
        </div>
        : <div className="flex flex-col gap-5">
          {[...Array(3)].map((_, idx) => (
            <Card key={idx} className="w-full bg-stone-200/40 border-none">
              <CardHeader>
                <div className="flex items-center my-4">
                  <Avatar className="h-14 w-14 me-2">
                    <AvatarFallback className="bg-gray-200">J K</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2 mx-5">
                    <div className="font-semibold dark:text-white text-lg">
                      <p>John Doe</p>
                    </div>
                    <Rating
                      value={4}
                      readOnly
                      className="mr-2 max-w-[100px]"
                      itemStyles={ratingStyle}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 mx-20">
                <CardTitle className="capitalize">Thinking to buy another one!</CardTitle>
                <p className="mb-2 text-gray-500 dark:text-gray-400">This is my third Invicta Pro Diver. They are just fantastic value for money. This one arrived yesterday and the first thing I did was set the time, popped on an identical strap from another Invicta and went in the shower with it to test the waterproofing.... No problems.</p>
                <p className="mb-3 text-gray-500 dark:text-gray-400">It is obviously not the same build quality as those very expensive watches. But that is like comparing a Citroën to a Ferrari. This watch was well under £100! An absolute bargain.</p>
              </CardContent>
              <CardFooter className="mx-20">
                <p>Reviewed on <span>March 3, 2017</span></p>
              </CardFooter>
            </Card>
          ))}
        </div>
      }
    </section>
  );
};