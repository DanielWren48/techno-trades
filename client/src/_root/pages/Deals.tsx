import { GridProductList } from "@/components/shared";
import { ProductLoader } from "@/components/product-filters";
import { useFilterProducts } from "@/api/queries/product";
import { Shell } from "@/components/dashboard/shell";
import { useGetCategories } from "@/api/queries/category";
import { ICategory } from "@/types";
import { useCategoryFilter, usePriceFilter } from "@/hooks/store";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { isEmpty } from "lodash";
import { MarkdownDisplay } from "@/_dashboard/components";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

type PriceOption = {
  label: string;
  value: number;
};

const priceOptions: PriceOption[] = [
  { label: '£30', value: 30 },
  { label: '£50', value: 50 },
  { label: '£100', value: 100 },
  { label: '£300', value: 300 },
];

export default function Deals() {
  const { max, setPriceRange } = usePriceFilter();
  const { toggleCategory, selectedCategories, removeCategory } = useCategoryFilter();

  const { data: _categories } = useGetCategories();
  const categories = _categories?.data as ICategory[] | undefined || [];

  const [markdown, setMarkdown] = React.useState('');

  React.useEffect(() => {
    setPriceRange(0, 9999)
    fetch('/gifts-for-every-occasion.md')
      .then((res) => res.text())
      .then((text) => setMarkdown(text));
  }, []);

  const { data: products, isPending: isProductLoading } = useFilterProducts(
    {
      filters: {
        discounted: true,
        prices: { min: 0, max: max },
        categories: [...selectedCategories]
      },
      params: { limit: 999 }
    }
  );

  function ShowProducts() {
    if (isProductLoading) {
      return <ProductLoader displayType="grid" />;
    }

    if (products?.data?.itemsCount === 0) {
      return (
        <div className="flex flex-col items-center w-full justify-center h-fit gap-3">
          <img src="/images/2762885.png" className="w-[30rem] object-contain" />
          <h1 className="text-4xl text-muted-foreground font-medium">Uh-oh! Looks like we can't keep up with you!</h1>
          <p className="text-xl text-muted-foreground font-extralight">Try removing some of the filters</p>
        </div>
      );
    }

    return (
      <GridProductList products={products?.data?.items ?? []} />
    );
  }

  return (
    <Shell className="flex flex-col items-start p-0 font-jost">
      <img
        src="images/deals-landing-header.png"
        className="fill"
        alt="image"
      />

      <section className="w-full my-5">
        <div className="flex flex-row justify-center items-center text-center">
          <h1 className="text-dark-4 dark:text-white/80 text-3xl">
            Shop gifts by price
          </h1>
        </div>
        <div className="flex items-center w-full my-5">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-center max-w-4xl mx-auto">
            {priceOptions.map((option) => (
              <Button
                key={option.value}
                onClick={() => setPriceRange(0, option.value)}
                className="w-28 h-28 rounded-full bg-teal-100 flex flex-col items-center justify-center shadow hover:scale-105 transition-transform"
              >
                <span className="text-lg text-gray-700">Under</span>
                <span className="text-3xl font-bold text-gray-900">{option.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full my-5">
        <div className="flex flex-row justify-between items-center my-5">
          <h1 className="text-dark-4 dark:text-white/80 text-3xl">
            Deals by Categories
          </h1>
        </div>
        <ul className="w-full grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {categories.map(({ _id, name, image, icon }) => (
            <li
              key={_id}
              className="group flex w-full flex-col self-center overflow-hidden rounded-lg bg-[#F3F3F3] dark:bg-dark-4 duration-700 ease-in-out"
            >
              <div className="relative m-6 h-40 hidden md:flex transform group-hover:animate-pulse transition-transform">
                <img
                  className="max-w-xs w-full h-full object-scale-down"
                  src={image}
                  alt="post"
                />
              </div>

              <Button
                className="flex m-6 h-16 overflow-hidden items-center justify-center rounded-xl bg-background hover:bg-background dark:bg-dark-2 transform transition duration-700 ease-in-out hover:shadow-2xl hover:-translate-y-3 hover:border-2"
                onClick={() => {
                  toggleCategory(_id);
                }}
              >
                <span className="h-5 w-5 mr-3 text-black md:hidden">{icon}</span>
                <h5 className="text-xl font-medium capitalize text-dark-4 dark:text-white/80">
                  {name}
                </h5>
              </Button>
            </li>
          ))}
        </ul>
      </section>

      {(!isEmpty(selectedCategories) || priceOptions.find(i => i.value === max)) && <section className="w-full my-5">
        <div className="flex flex-row justify-between items-center my-5">
          <h1 className="text-dark-4 dark:text-white/80 text-3xl">
            Applied Filters
          </h1>
        </div>
        <div className="flex flex-wrap">
          {!isEmpty(selectedCategories) && selectedCategories.map((category, idx) => (
            <div key={`category-${idx}`} className="flex items-center mb-2 mr-3">
              <span className="inline-flex items-center rounded-md capitalize bg-purple-50 px-4 py-2 text-base font-medium text-purple-800 ring-1 ring-inset ring-purple-600/20">
                {categories?.find(c => c._id === category)?.name}
                <X
                  className="cursor-pointer ml-1 text-black"
                  onClick={() => removeCategory(category)}
                />
              </span>
            </div>
          ))}
          {priceOptions.find(i => i.value === max) &&
            <div className="flex items-center mb-2 mr-3">
              <span className="inline-flex items-center rounded-md capitalize bg-purple-50 px-4 py-2 text-base font-medium text-purple-800 ring-1 ring-inset ring-purple-600/20">
                under £{max}
                <X
                  className="cursor-pointer ml-1 text-black"
                  onClick={() => setPriceRange(0, 9999)}
                />
              </span>
            </div>
          }
        </div>
      </section>}

      <ShowProducts />

      <section className="w-full my-5">
        <Card className="w-ful">
          <CardContent className="prose prose-sm max-w-none">
            <MarkdownDisplay content={markdown} />
          </CardContent>
        </Card>
      </section>
    </Shell>
  );
};