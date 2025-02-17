//@ts-ignore
import { Splide, SplideSlide, SplideTrack } from "@splidejs/react-splide";
import { calculateDiscountPercentage, cn, formatPrice } from "@/lib/utils";
import { AutoScroll } from "@splidejs/splide-extension-auto-scroll";
import "@splidejs/splide/dist/css/splide.min.css";
import { buttonVariants } from "../ui/button";
import { Link } from "react-router-dom";
import { Product } from "@/types";
import { useGetProducts } from "@/api/products/queries";

const SplideCarousel = () => {
    const { data, isPending: isProductLoading } = useGetProducts();
    const products = data?.data?.items

    return (
        <Splide
            hasTrack={false}
            options={{
                type: "loop",
                drag: "free",
                arrows: true,
                pagination: true,
                perPage: 4,
                width: "100%",
                gap: "25px",
                breakpoints: {
                    767: {
                        width: "100%",
                        perPage: 2,
                        padding: { right: "5rem" },
                    },
                    1000: {
                        perPage: 1,
                        padding: { right: "4rem" },
                    },
                    1200: {
                        padding: { right: "8rem" },
                    },
                },
                autoScroll: {
                    pauseOnHover: true,
                    pauseOnFocus: true,
                    rewind: false,
                    speed: 3
                }
            }}
            className={""}
            extensions={{ AutoScroll }}
        >
            <div className="p-10">
                <SplideTrack>
                    {!isProductLoading && products && products.map((product: Product) => (
                        <SplideSlide key={product._id} className="splide__slide relative bg-white dark:bg-dark-4 border-2 rounded-xl font-jost">
                            <span className="absolute top-0 left-0 px-6 py-3 rounded-tl-xl rounded-br-xl bg-purple-100 text-lg font-bold text-purple-800 ring-1 ring-inset ring-purple-600/30">
                                {calculateDiscountPercentage({ normalPrice: product.price, discountedPrice: product.discountedPrice })}%
                            </span>
                            <div className="flex w-full flex-col self-center mt-10 gap-10">
                                <div className="select-none flex items-center justify-center bg-white m-auto p-5 rounded-lg mt-5">
                                    <img className="w-44 h-44 object-scale-down" src={product.image[0].url} alt="post" />
                                </div>
                                <div className="flex flex-col px-5 pb-5 gap-4">
                                    <h5 className="text-2xl font-medium tracking-tight text-dark-3 dark:text-white/80">{product.name}</h5>
                                    <div className="mb-5 flex items-center justify-between text-dark-3 dark:text-white/80">
                                        <span className="text-2xl font-semibold">
                                            <span>{product && formatPrice(product.discountedPrice!, { currency: "GBP" })}</span>
                                            <span className="ml-3 text-base font-normal line-through">
                                                {product && formatPrice(product.price, { currency: "GBP" })}
                                            </span>
                                        </span>
                                    </div>
                                    <Link to={`/products/${product.slug}`}
                                        className={cn(buttonVariants(), "w-full bg-dark-4 dark:bg-dark-2 py-6 text-2xl dark:text-white/80")}
                                    >
                                        View Rroduct
                                    </Link>
                                </div>
                            </div>
                        </SplideSlide>
                    ))}
                </SplideTrack>
            </div>
            <style>
                {`
                .splide__arrow {
                    background-color: #996af171;
                    color: #333333;
                }

                .splide__arrow--next {
                    right: 1px;
                }

                .splide__arrow--prev {
                    left: 1px;
                }
                `}
            </style>
        </Splide>
    );
}

export default SplideCarousel