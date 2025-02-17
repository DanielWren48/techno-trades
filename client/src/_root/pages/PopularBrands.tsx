import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Product } from "@/types";
import { first, sortBy } from "lodash";
import { Link } from "react-router-dom";
import { useBrandFilter } from "@/hooks/store";
import { Shell } from "@/components/dashboard/shell";
import { buttonVariants } from "@/components/ui/button";
import { useGetProducts } from "@/api/products/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PopularBrands = () => {
    const { data, isLoading } = useGetProducts();
    const { toggleBrand, removeAllBrands } = useBrandFilter();

    const brands = useMemo(() => {
        if (isLoading) return
        const products = data?.data?.items
        return Array.from(new Set(products!.map((product: Product) => first(product.brand)))).map((letter) => {
            const uniqueBrands: string[] = Array.from(
                new Set(
                    products
                        ?.filter((product: Product) => first(product.brand) === letter)
                        .map((product: Product) => product.brand)
                )
            );
            return { letter, uniqueBrands };
        });
    }, [isLoading]);

    const sortedBrands = sortBy(brands, ["letter"]);

    return (
        <Shell className="flex flex-col items-start p-0 font-jost">
            <Card className="w-full bg-teal-600/20 text-center">
                <CardHeader>
                    <CardTitle className="text-4xl text-purple-800 tracking-normal">Popular brands</CardTitle>
                </CardHeader>
                <CardContent className="text-2xl">
                    <span className="text-rose-600 font-medium">Looking for your favourite brands?</span> You’ll find them all listed here.
                </CardContent>
            </Card>
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7 mt-5">
                {sortedBrands.map(({ letter, uniqueBrands }) => (
                    <Card key={letter} className="text-center min-h-[15rem]">
                        <CardHeader>
                            <CardTitle>{letter}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-1">
                            {uniqueBrands.map((brand) => (
                                <Link
                                    key={brand}
                                    onClick={() => {
                                        removeAllBrands();
                                        toggleBrand(brand);
                                    }}
                                    className={cn(
                                        buttonVariants,
                                        "text-lg hover:underline"
                                    )}
                                    to="/explore"
                                >
                                    <h5 className="text-xl font-medium text-dark-4 dark:text-white/80 font-jost">
                                        {brand}
                                    </h5>
                                </Link>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </Shell>
    );
};

export default PopularBrands;
