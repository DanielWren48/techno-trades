import { useTheme } from "next-themes";
import { Link } from "react-router-dom";
import { Product } from "@/types/index";
import AddToCartButton from "./AddToCartButton";
import AddToFavoritesButton from "./AddToFavoritesButton";
import { formatPrice } from "@/lib/utils";

type GridProductListProps = {
  products: Product[];
};

const GridProductList = ({ products }: GridProductListProps) => {
  const { theme } = useTheme();
  return (
    <>
      <ul className="w-full grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-7 mt-5">
        {products.map((product) => (
          <div key={product._id} className={`${product.isDiscounted
            ? 'relative overflow-hidden rounded-xl p-[5px] backdrop-blur-3xl'
            : 'relative border rounded-xl shadow-md '} bg-background dark:bg-dark-4 transform transition duration-500 ease-in-out hover:shadow-2xl hover:-translate-y-3 dark:hover:shadow-black/40 `}
          >
            {product.isDiscounted && <span className='absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]' />}
            <div className={`${product.isDiscounted && 'inline-flex h-full w-full items-center justify-center rounded-xl bg-background dark:bg-dark-4 transform transition duration-500 ease-in-out text-sm font-medium text-white backdrop-blur-3xl'}`}>
              {product.isDiscounted &&
                <span className="absolute top-0 left-0 px-6 py-3 rounded-tl-xl rounded-br-xl bg-purple-100 text-lg font-medium text-purple-800 ring-1 ring-inset ring-purple-600/30">
                  {product.discountPercentage}%
                </span>
              }
              <div className="absolute top-0 right-0">
                <AddToFavoritesButton product={product} variant="icon" theme={theme === "dark" ? "dark" : "light"} />
              </div>
              <div className="flex w-full flex-col self-center mt-10 gap-10">
                <Link to={`/products/${product.slug}`}>
                  <div className="select-none mx-10 flex items-top justify-center bg-white m-auto p-5 rounded-lg mt-8">
                    <img className="w-44 h-44 object-scale-down" src={product.image[0].url} alt="post" />
                  </div>
                </Link>
                <div className="flex flex-col px-5 pb-5 gap-4 text-dark-4 dark:text-white/80">
                  <h5 className="text-xl tracking-tight">
                    {product.name}
                  </h5>
                  <div className="mt-2 mb-5 flex items-center justify-between">
                    <span className="text-2xl font-semibold">
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
                    </span>
                  </div>

                  <AddToCartButton product={product} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </ul>
    </>
  )
}

export default GridProductList;
