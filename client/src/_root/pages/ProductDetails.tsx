import "@smastrom/react-rating/style.css";
import { useEffect, useState } from "react";
import { ProductImage } from "@/types";
import { ProductReviews } from "../components";
import { Rating } from "@smastrom/react-rating";
import { Button } from "@/components/ui/button";
import { Shell } from "@/components/dashboard/shell";
import { ArrowLeft, Fullscreen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import SimilarProducts from "../components/SimilarProducts";
import { useGetProductBySlug } from "@/api/queries/product";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import MarkdownDisplay from "@/_dashboard/components/product/MarkdownDisplay";
import { AddToCartButton, AddToFavoritesButton } from "@/components/shared";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { calculateDiscountPercentage, cn, formatPrice, isProductAddedWithinNDays, ratingStyle } from "@/lib/utils";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (!slug) {
      navigate(-1);
      setRedirected(true);
    }
  }, [slug, navigate]);

  const { data, isLoading } = useGetProductBySlug(slug || '');
  const product = data?.data;
  const [mainImage, setMainImage] = useState<ProductImage | undefined>(product?.image[0]);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (data && !data.data && !isLoading) {
      navigate(-1);
      setRedirected(true);
    }
  }, [data, isLoading, navigate]);

  if (redirected) {
    return null;
  }

  if (isLoading) {
    return (
      <Shell className="items-start mt-[10rem]">
        <div role="status" className="space-y-8 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex md:items-center">
          <div className="flex items-center justify-center w-full h-80 bg-gray-300 rounded sm:w-[50rem] dark:bg-gray-700">
            <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
              <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
            </svg>
          </div>
          <div className="w-full">
            <div className="h-5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[480px] mb-2.5"></div>
            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[440px] mb-2.5"></div>
            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[460px] mb-2.5"></div>
            <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
          </div>
          <span className="sr-only">Loading...</span>
        </div>
      </Shell>
    )
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <Shell>
      <Button
        className={cn("mb-10 text-sm max-w-[10rem]")}
        size={"lg"}
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 w-6 h-6" />
        Back
      </Button >
      <div className="flex flex-wrap mb-24 -mx-4 ">
        <div className="w-full px-4 mb-8 md:w-1/2 md:mb-0">
          <div className="sticky top-0 overflow-hidden">
            <div onClick={() => setOpen(true)} className="relative mb-6 lg:mb-10 lg:h-96 border-2 rounded-xl bg-white cursor-pointer">
              <img
                className="object-contain w-full lg:h-full p-3"
                src={mainImage?.url}
                alt={mainImage?.name}
              />
              <Fullscreen className="absolute top-5 right-5 w-8 h-8 dark:text-dark-4" />
            </div>
            <div className="flex-wrap hidden -mx-2 md:flex">
              {product.image.map((image) => (
                <div key={image._id} className="w-1/2 p-2 sm:w-1/4">
                  <a
                    className="block border-2 rounded-xl bg-white p-2 border-gray-200 hover:border-blue-400 dark:border-gray-700 dark:hover:border-blue-300"
                    onClick={() => setMainImage(image)}
                  >
                    <img
                      className="object-contain w-full lg:h-28 cursor-pointer"
                      src={image.url}
                      alt=""
                    />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full px-4 md:w-1/2">
          <div className="lg:pl-20 font-jost">
            <div className="mb-6 ">
              <div className="flex items-center space-x-2">
                {product.isDiscounted &&
                  <>
                    <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-base font-semibold text-purple-800 ring-1 ring-inset ring-purple-600/20">Epic Deal</span>
                    <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-1 text-base font-semibold text-sky-800 ring-1 ring-inset ring-sky-600/20">
                      {calculateDiscountPercentage({ normalPrice: product.price, discountedPrice: product.discountedPrice })}% off
                    </span>
                  </>
                }
                {product.countInStock === 0 &&
                  <span className="inline-flex items-center rounded-md bg-red-50 px-3 py-1 text-base font-semibold text-red-800 ring-1 ring-inset ring-red-600/20">Out of Stock</span>
                }
                {(product.countInStock <= 5 && product.countInStock !== 0) &&
                  <span className="inline-flex items-center rounded-md bg-red-50 px-3 py-1 text-base font-semibold text-red-800 ring-1 ring-inset ring-red-600/20">Low Stock</span>
                }
                {isProductAddedWithinNDays({ product, nDays: 14 }) &&
                  <span className="inline-flex items-center rounded-md bg-yellow-50 px-3 py-1 text-base font-semibold text-yellow-800 ring-1 ring-inset ring-yellow-600/20">New Arrival</span>
                }
              </div>

              <h2 className="max-w-xl mt-6 mb-6 text-xl font-semibold leading-loose tracking-wide md:text-2xl">
                {product.name}
              </h2>
              <div className="flex flex-wrap items-center mb-6">
                <Rating
                  value={product.avgRating}
                  readOnly
                  className="mr-2 max-w-[100px]"
                  itemStyles={ratingStyle}
                />
                <p>({product.reviewsCount})</p>
              </div>
              <p className="inline-block text-2xl font-semibold">
                {product.isDiscounted ? (
                  <>
                    <span>{formatPrice(product.discountedPrice!, { currency: "GBP" })}</span>
                    <span className="ml-3 text-base font-normal text-gray-500 line-through dark:text-gray-400">
                      {formatPrice(product.price, { currency: "GBP" })}
                    </span>
                  </>
                ) : (
                  product && formatPrice(product.price, { currency: "GBP" })
                )}
              </p>
            </div>
            <AddToCartButton product={product} />
            <div className="mt-2" />
            <AddToFavoritesButton product={product} variant="button" />
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-8 max-w-screen-lg select-none">
                <Carousel className="lg:col-span-2 mx-10">
                  <CarouselContent>
                    {product.image.map((_, index) => (
                      <CarouselItem
                        key={index}
                        className="flex aspect-square items-center justify-center p-6 cursor-grab"
                        onMouseDown={(e) => e.currentTarget.style.cursor = "grabbing"}
                        onMouseUp={(e) => e.currentTarget.style.cursor = "grab"}
                        onMouseLeave={(e) => e.currentTarget.style.cursor = "grab"}
                      >
                        <img className="object-contain" src={product.image[index].url} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
                <div className="flex flex-col gap-3 h-full rounded-lg bg-accent p-2">
                  {product.image.map((image) => (
                    <div key={image._id} className="block border-2 rounded-xl bg-white p-2 border-gray-200" >
                      <img className="object-contain w-full h-32" src={image.url} />
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Card className="w-full m-4 p-5 mt-[5rem]">
          <CardContent className="prose prose-sm max-w-none">
            <MarkdownDisplay content={product.description} />
          </CardContent>
        </Card>
      </div>
      <SimilarProducts id={product._id} category={product.category} />
      <ProductReviews product={product} />
    </Shell >
  );
};
