import "@smastrom/react-rating/style.css";
import { useState } from "react";
import { ProductImage } from "@/types";
import { Rating } from "@smastrom/react-rating";
import { Button } from "@/components/ui/button";
import { Shell } from "@/components/dashboard/shell";
import { ArrowLeft, Fullscreen } from "lucide-react";
import { useUserContext } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import ReviewsSection from "@/components/root/ReviewsSection";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Link, useNavigate, useParams } from "react-router-dom";
import ProductReviewForm from "@/components/root/ProductReviewForm";
import MarkdownDisplay from "@/_dashboard/components/product/MarkdownDisplay";
import { AddToCartButton, AddToFavoritesButton } from "@/components/shared";
import { useFilterProducts, useGetProductBySlug, useGetSimimarProducts } from "@/api/products/queries";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { calculateDiscountPercentage, cn, formatPrice, isProductAddedWithinNDays, ratingStyle } from "@/lib/utils";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useUserContext();

  if (!slug) return navigate(-1)

  // First query - get product details
  const { data: productData, isLoading: productLoading } = useGetProductBySlug(slug);
  const product = productData?.data;

  // Second query - get products of the same category
  const { data: similarProductsData, isLoading: similarProductsLoading } = useGetSimimarProducts(
    {
      params: { limit: 4 },
      //@ts-expect-error
      filters: { categories: [product?.category] },
      currentProductId: product?._id
    }
  )
  const similarProducts = similarProductsData?.data?.items;
  console.log(similarProducts)

  const [mainImage, setMainImage] = useState<ProductImage | undefined>(product?.image[0]);
  const [open, setOpen] = useState<boolean>(false);

  if (productLoading) {
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
              {product?.image.map((image) => (
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
                {product?.isDiscounted &&
                  <>
                    <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-base font-semibold text-purple-800 ring-1 ring-inset ring-purple-600/20">Epic Deal</span>
                    <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-1 text-base font-semibold text-sky-800 ring-1 ring-inset ring-sky-600/20">
                      {calculateDiscountPercentage({ normalPrice: product.price, discountedPrice: product.discountedPrice })}% off
                    </span>
                  </>
                }
                {product && product.countInStock === 0 &&
                  <span className="inline-flex items-center rounded-md bg-red-50 px-3 py-1 text-base font-semibold text-red-800 ring-1 ring-inset ring-red-600/20">Out of Stock</span>
                }
                {product && (product.countInStock <= 5 && product.countInStock !== 0) &&
                  <span className="inline-flex items-center rounded-md bg-red-50 px-3 py-1 text-base font-semibold text-red-800 ring-1 ring-inset ring-red-600/20">Low Stock</span>
                }
                {product && isProductAddedWithinNDays({ product, nDays: 14 }) &&
                  <span className="inline-flex items-center rounded-md bg-yellow-50 px-3 py-1 text-base font-semibold text-yellow-800 ring-1 ring-inset ring-yellow-600/20">New Arrival</span>
                }
              </div>

              <h2 className="max-w-xl mt-6 mb-6 text-xl font-semibold leading-loose tracking-wide md:text-2xl">
                {product?.name}
              </h2>
              <div className="flex flex-wrap items-center mb-6">
                <Rating
                  value={product?.rating || 0}
                  readOnly
                  className="mr-2 max-w-[100px]"
                  itemStyles={ratingStyle}
                />
              </div>
              <p className="inline-block text-2xl font-semibold">
                {product?.isDiscounted ? (
                  <>
                    <span>{product && formatPrice(product.discountedPrice!, { currency: "GBP" })}</span>
                    <span className="ml-3 text-base font-normal text-gray-500 line-through dark:text-gray-400">
                      {product && formatPrice(product.price, { currency: "GBP" })}
                    </span>
                  </>
                ) : (
                  product && formatPrice(product.price, { currency: "GBP" })
                )}
              </p>
            </div>
            {spectsSection()}
            {product && <AddToCartButton product={product} />}
            <div className="mt-2" />
            {product && <AddToFavoritesButton product={product} variant="button" />}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-8 max-w-screen-lg select-none">
                <Carousel className="lg:col-span-2 mx-10">
                  <CarouselContent>
                    {product?.image.map((_, index) => (
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
                  {product?.image.map((image) => (
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
            <MarkdownDisplay content={product!.description} />
          </CardContent>
        </Card>
      </div>
      <section>
        <div className="flex flex-row justify-between items-center my-4 font-jost">
          <h1 className="text-dark-3 dark:text-white/80 text-3xl">You might also like</h1>
        </div>

        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8 bg-[#F3F3F3] dark:bg-dark-4 rounded-xl">
          <div className="mx-auto max-w-2xl py-16 sm:py-24 lg:max-w-none lg:py-12 font-jost">
            <div className="mt-6 space-y-12 lg:grid lg:grid-cols-3 lg:gap-x-6 lg:space-y-0">
              {!similarProductsLoading && similarProducts && similarProducts.map((product) => (
                <Link to={`/products/${product.slug}`} key={product._id}>
                  <div className="group relative">
                    <div className="transform group-hover:-translate-y-3 transition-transform duration-500 ease-out">
                      <div className="relative h-80 w-full overflow-hidden rounded-lg bg-white sm:aspect-h-1 sm:aspect-w-2 lg:aspect-h-1 lg:aspect-w-1 sm:h-64">
                        <img
                          src={product.image[0].url}
                          alt={product.name}
                          className="h-full w-full object-contain object-center p-5"
                        />
                      </div>
                      <div className="transform origin-center text-dark-4 dark:text-white/80 group-hover:scale-125 group-hover:translate-x-14 transition-transform duration-700 ease-out">
                        <h3 className="mt-6 text-sm  capitalize">{product.category}</h3>
                        <p className="text-base font-semibold">{product.name}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
      <br />
      {isAuthenticated && product && (<ProductReviewForm product={product} />)}
      <br />
      {product && (<ReviewsSection product={product} />)}
    </Shell >
  );
};

function spectsSection() {
  return (
    <div className="mb-6">
      <h2 className="mb-2 text-lg font-bold text-gray-700 dark:text-gray-300">
        System Specs :
      </h2>
      <div className="bg-gray-100 dark:bg-dark-4 rounded-xl">
        <div className="p-3 lg:p-5 ">
          <div className="p-2 rounded-xl lg:p-6 dark:bg-dark-3 bg-gray-50">
            <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
              <div className="w-full mb-4 md:w-2/5">
                <div className="flex ">
                  <span className="mr-3 text-gray-500 dark:text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-diagram-3 w-7 h-7"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 3.5A1.5 1.5 0 0 1 7.5 2h1A1.5 1.5 0 0 1 10 3.5v1A1.5 1.5 0 0 1 8.5 6v1H14a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0v-1A.5.5 0 0 1 2 7h5.5V6A1.5 1.5 0 0 1 6 4.5v-1zM8.5 5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1zM0 11.5A1.5 1.5 0 0 1 1.5 10h1A1.5 1.5 0 0 1 4 11.5v1A1.5 1.5 0 0 1 2.5 14h-1A1.5 1.5 0 0 1 0 12.5v-1zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zm4.5.5A1.5 1.5 0 0 1 7.5 10h1a1.5 1.5 0 0 1 1.5 1.5v1A1.5 1.5 0 0 1 8.5 14h-1A1.5 1.5 0 0 1 6 12.5v-1zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1zm4.5.5a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5v-1zm1.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1z"
                      ></path>
                    </svg>
                  </span>
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      No. of cores
                    </p>
                    <h2 className="text-base font-semibold text-gray-700 dark:text-gray-400">
                      12 Cores
                    </h2>
                  </div>
                </div>
              </div>
              <div className="w-full mb-4 md:w-2/5">
                <div className="flex ">
                  <span className="mr-3 text-gray-500 dark:text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-gpu-card w-7 h-7"
                      viewBox="0 0 16 16"
                    >
                      <path d="M4 8a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm7.5-1.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"></path>
                      <path d="M0 1.5A.5.5 0 0 1 .5 1h1a.5.5 0 0 1 .5.5V4h13.5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5H2v2.5a.5.5 0 0 1-1 0V2H.5a.5.5 0 0 1-.5-.5Zm5.5 4a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM9 8a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0Z"></path>
                      <path d="M3 12.5h3.5v1a.5.5 0 0 1-.5.5H3.5a.5.5 0 0 1-.5-.5v-1Zm4 1v-1h4v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5Z"></path>
                    </svg>
                  </span>
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Graphic
                    </p>
                    <h2 className="text-base font-semibold text-gray-700 dark:text-gray-400">
                      Intel UHD
                    </h2>
                  </div>
                </div>
              </div>
              <div className="w-full mb-4 lg:mb-0 md:w-2/5">
                <div className="flex ">
                  <span className="mr-3 text-gray-500 dark:text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="w-7 h-7 bi bi-cpu"
                      viewBox="0 0 16 16"
                    >
                      <path d="M5 0a.5.5 0 0 1 .5.5V2h1V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 1 0V2A2.5 2.5 0 0 1 14 4.5h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14a2.5 2.5 0 0 1-2.5 2.5v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14A2.5 2.5 0 0 1 2 11.5H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2A2.5 2.5 0 0 1 4.5 2V.5A.5.5 0 0 1 5 0zm-.5 3A1.5 1.5 0 0 0 3 4.5v7A1.5 1.5 0 0 0 4.5 13h7a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 11.5 3h-7zM5 6.5A1.5 1.5 0 0 1 6.5 5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5v-3zM6.5 6a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"></path>
                    </svg>
                  </span>
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Processor
                    </p>
                    <h2 className="text-base font-semibold text-gray-700 dark:text-gray-400">
                      INTEL 80486
                    </h2>
                  </div>
                </div>
              </div>
              <div className="w-full mb-4 lg:mb-0 md:w-2/5">
                <div className="flex ">
                  <span className="mr-3 text-gray-500 dark:text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-clock-history w-7 h-7"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8.515 1.019A7 7 0 0 0 8 1V0a8 8 0 0 1 .589.022l-.074.997zm2.004.45a7.003 7.003 0 0 0-.985-.299l.219-.976c.383.086.76.2 1.126.342l-.36.933zm1.37.71a7.01 7.01 0 0 0-.439-.27l.493-.87a8.025 8.025 0 0 1 .979.654l-.615.789a6.996 6.996 0 0 0-.418-.302zm1.834 1.79a6.99 6.99 0 0 0-.653-.796l.724-.69c.27.285.52.59.747.91l-.818.576zm.744 1.352a7.08 7.08 0 0 0-.214-.468l.893-.45a7.976 7.976 0 0 1 .45 1.088l-.95.313a7.023 7.023 0 0 0-.179-.483zm.53 2.507a6.991 6.991 0 0 0-.1-1.025l.985-.17c.067.386.106.778.116 1.17l-1 .025zm-.131 1.538c.033-.17.06-.339.081-.51l.993.123a7.957 7.957 0 0 1-.23 1.155l-.964-.267c.046-.165.086-.332.12-.501zm-.952 2.379c.184-.29.346-.594.486-.908l.914.405c-.16.36-.345.706-.555 1.038l-.845-.535zm-.964 1.205c.122-.122.239-.248.35-.378l.758.653a8.073 8.073 0 0 1-.401.432l-.707-.707z"></path>
                      <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0v1z"></path>
                      <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5z"></path>
                    </svg>
                  </span>
                  <div>
                    <p className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Frequency
                    </p>
                    <h2 className="text-base font-semibold text-gray-700 dark:text-gray-400">
                      3.5 GHz
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}