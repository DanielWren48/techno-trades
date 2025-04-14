import { Link } from "react-router-dom";
import { FC } from "react";
import { useGetProducts } from "@/api/queries/product";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const NewArrivals: FC = () => {
  const { data, isLoading: allProductsLoading } = useGetProducts({ limit: 3 });

  const products = data?.data?.items

  return (
    <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8 bg-[#F3F3F3] dark:bg-dark-4 transform transition duration-700 ease-in-out rounded-xl">
      <div className="mx-auto max-w-2xl py-16 sm:py-24 lg:max-w-none lg:py-32 font-jost">
        <h1 className="text-dark-3 dark:text-white/80 text-3xl">New Arrivals</h1>

        <div className="mt-6 space-y-12 lg:grid lg:grid-cols-3 lg:gap-x-6 lg:space-y-0">
          {allProductsLoading && [...Array(3)].map((_, index) => renderProductGridLoader(index))}
          {!allProductsLoading && products && products.map((product) => (
            <Link to={`/products/${product.slug}`} key={product._id}>
              <div className="group relative">
                <div className="transform group-hover:-translate-y-3 transition-transform duration-700 ease-out">
                  <div className="relative h-80 w-full overflow-hidden rounded-lg bg-white sm:aspect-h-1 sm:aspect-w-2 lg:aspect-h-1 lg:aspect-w-1 sm:h-64">
                    <img
                      src={product.image[0].url}
                      alt={product.name}
                      className="h-full w-full object-contain object-center p-5"
                    />
                  </div>
                  <div className="transform origin-center group-hover:scale-125 group-hover:translate-x-14 transition-transform duration-700 ease-out">
                    <h3 className="mt-6 text-sm text-gray-500 dark:text-white/80 capitalize">{product.category}</h3>
                    <p className="text-base font-semibold text-gray-900 dark:text-white/90">{product.name}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewArrivals;

const renderProductGridLoader = (index: number) => (
  <Card key={index}>
    <CardContent className="flex flex-col gap-8 my-6">
      <div className="flex items-center justify-center w-full h-full bg-gray-300 rounded sm:h-[12rem] dark:bg-gray-700">
        <svg className="w-28 h-28 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
          <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
        </svg>
      </div>
      <div className="flex flex-col gap-8 w-full h-full items-center justify-center">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </CardContent>
  </Card>
);