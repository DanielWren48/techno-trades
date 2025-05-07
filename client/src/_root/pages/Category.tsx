import { cn, hexToRGBA } from '@/lib/utils';
import { isEmpty, last, take } from 'lodash';
import { Fragment, useMemo } from 'react';
import { ICategory, Product } from '@/types';
import { Link, useParams } from 'react-router-dom';
import { Shell } from '@/components/dashboard/shell';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFilterProducts } from '@/api/queries/product';
import { useGetCategoryBySlug } from '@/api/queries/category';
import { MarkdownDisplay } from '@/_dashboard/components';
import { useBrandFilter, useCategoryFilter } from '@/hooks/store';

export default function CategoryPage() {
    const { parentSlug } = useParams();
    const { toggleCategory, selectedCategories } = useCategoryFilter();

    const { data, isLoading } = useGetCategoryBySlug(parentSlug || '');
    const category = data?.data;

    if (isLoading) {
        return <div className="container mx-auto py-8">Loading category...</div>;
    }

    if (!category) {
        return <div className="container mx-auto py-8">Category not found</div>;
    }

    return (
        <Shell className="flex flex-col items-start p-0 ">
            <section className="relative flex items-center bg-[#f9d2e5] rounded-3xl overflow-hidden w-full h-[300px] font-jost" style={{ backgroundColor: category.display.colour }}>
                <div className="flex flex-col justify-center text-center w-[55%] gap-4 pl-6 md:pl-20">
                    <h1 className="text-5xl font-medium leading-snug text-purple-800">
                        {category.display.title}
                    </h1>
                    <p className="text-2xl font-normal leading-relaxed text-black">
                        {category.display.subtitle}
                    </p>
                </div>
                <div className="flex items-center justify-center w-[45%] h-full">
                    <img
                        src={category.display.image}
                        alt="Camera Banner"
                        className="h-full object-cover"
                    />
                </div>
            </section>

            <section className='w-full'>
                <h2 className="text-xl font-semibold mb-4 text-center">{category.display.title}</h2>
                {category.subcategories && category.subcategories.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {category.subcategories.map(({ _id, name, image }) => (
                            <div key={_id} className="p-4 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors" >
                                <Button
                                    variant={"link"}
                                    onClick={() => toggleCategory(_id)}
                                    className={"flex flex-col w-full items-center justify-center p-2 h-32 rounded-md text-center text-base font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"}
                                >
                                    <img src={image} alt={name} className="h-24 w-24 object-contain" />
                                    <h5>{name}</h5>
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <TopDealsOfCategory categoryId={last(selectedCategories) || category._id} />

            <section
                className="relative flex items-center rounded-3xl overflow-hidden w-full font-jost p-4 border-2"
                style={{ backgroundColor: hexToRGBA(category.display.colour, 0.3) }}
            >
                <MarkdownDisplay content={category.desc} />
            </section>
        </Shell >
    );
}

function TopDealsOfCategory({ categoryId }: { categoryId: ICategory["_id"] }) {
    const { toggleBrand, removeAllBrands } = useBrandFilter();

    const { data: products, isLoading: loadingProducts } = useFilterProducts({
        filters: { categories: [categoryId], }
    })

    const productsData = products?.data?.items;

    if (loadingProducts) {
        return <div>Loading...</div>
    }

    if ((isEmpty(productsData) || !productsData)) {
        return null;
    }

    return (
        <Fragment>
            <section className='w-full'>
                <div className="flex flex-row justify-between items-center my-4 font-jost">
                    <h1 className="text-dark-3 dark:text-white/80 text-3xl">Top Deals</h1>
                </div>
                <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8 bg-[#F3F3F3] dark:bg-dark-4 rounded-xl">
                    <div className="mx-auto max-w-2xl py-16 sm:py-24 lg:max-w-none lg:py-12 font-jost">
                        <div className="mt-6 space-y-12 lg:grid lg:grid-cols-3 lg:gap-x-6 lg:space-y-0">
                            {take(productsData, 3).map((product) => (
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

            <section className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7 mt-5">
                {Array.from(new Set(productsData?.map((product: Product) => product.brand))).map((brand, idx) => (
                    <Card key={idx}>
                        <CardContent className='flex flex-col items-center justify-center text-center py-10'>
                            <Link
                                key={brand}
                                onClick={() => { removeAllBrands(); toggleBrand(brand) }}
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
                        </CardContent>
                    </Card>
                ))}
            </section>
        </Fragment>

    );
};