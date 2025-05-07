import { isEmpty, indexOf, find } from "lodash";
import { Product, ICategory } from "@/types";
import { Link } from "react-router-dom";
import "@smastrom/react-rating/style.css";
import { useFilterProducts } from "@/api/queries/product";

interface RecommendedProductsType {
    productId: Product["_id"]
    brand: Product["brand"]
}

export default function RecommendedProducts({ productId, brand }: RecommendedProductsType) {
    const { data, isLoading } = useFilterProducts({
        filters: { brands: [brand] }
    })

    const products = data?.data?.items?.splice(data?.data?.items.findIndex(function (i) {
        return i._id === productId;
    }), 1);

    if (isLoading) {
        return <div>Loading...</div>
    }

    if ((isEmpty(products) || !products)) {
        return null;
    }

    return (
        <section>
            <div className="flex flex-row justify-between items-center my-4 font-jost">
                <h1 className="text-dark-3 dark:text-white/80 text-3xl">Also from {brand}</h1>
            </div>
            <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8 bg-[#F3F3F3] dark:bg-dark-4 rounded-xl">
                <div className="mx-auto max-w-2xl py-16 sm:py-24 lg:max-w-none lg:py-12 font-jost">
                    <div className="mt-6 space-y-12 lg:grid lg:grid-cols-3 lg:gap-x-6 lg:space-y-0">
                        {products.map((product) => (
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
                                            <h3 className="mt-6 text-sm capitalize">{product.category.name}</h3>
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

    );
};
