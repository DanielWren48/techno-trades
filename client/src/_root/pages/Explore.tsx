import { useState } from "react";
import { ProductCategory } from "@/types";
import { useFilterProducts } from "@/api/products/queries";
import { GridProductList, ListProductList } from "@/components/shared";
import { Pagination, PaginationContent } from "@/components/ui/pagination"
import { useSorting, useBrandFilter, useStockFiltering, useCategoryFilter, usePriceFilter } from "@/hooks/store";
import { FilterLoader, ProductFilters, ProductLoader, ProductSearch, ProductSorting } from "@/components/product-filters";

export default function Explore() {
  const { hideOutOfStock } = useStockFiltering();
  const { isChecked, selectedShowPerPage } = useSorting();
  const { debouncedMin, debouncedMax } = usePriceFilter();
  const { selectedCategories } = useCategoryFilter();
  const { selectedBrands } = useBrandFilter();
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { data: products, isLoading: loadingProducts } = useFilterProducts(
    {
      params: { page: currentPage.toString(), limit: selectedShowPerPage },
      filters: {
        hideOutOfStock: hideOutOfStock,
        prices: { min: debouncedMin, max: debouncedMax },
        brands: selectedBrands,
        categories: [...selectedCategories as ProductCategory[]],
      }
    }
  )
  const productsData = products?.data?.items;

  if (loadingProducts) {
    return (
      <div className="flex flex-col flex-1 items-center bg-[#F3F3F3] dark:bg-dark-2 transform transition duration-500 ease-in-out">
        <div className="w-full px-2.5 md:px-10 my-20 max-w-screen-2xl">
          <ProductSearch />
          <div className="flex flex-row min-h-[65rem]">
            <div className="basis-1/4 hidden xl:block">
              <FilterLoader />
            </div>
            <div className="flex flex-col xl:basis-3/4 lg:basis-full xl:ml-5">
              <ProductSorting />
              <ProductLoader displayType={isChecked ? 'grid' : 'list'} showFilterLoader />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-[#F3F3F3] dark:bg-dark-2 transform transition duration-500 ease-in-out">
      <div className="w-full px-2.5 md:px-10 my-20 max-w-screen-2xl">
        <ProductSearch />
        <div className="flex flex-row min-h-[65rem]">
          <div className="basis-1/4 hidden xl:block">
            <ProductFilters />
          </div>
          <div className="flex flex-col xl:basis-3/4 lg:basis-full xl:ml-5">
            <ProductSorting />
            {(productsData && products?.data?.totalPages! > 0) ? (
              isChecked ? (<GridProductList products={productsData} />) : (<ListProductList products={productsData} />)
            ) : (
              <div className="flex flex-col items-center w-full justify-center h-full gap-3">
                <img src="/images/2762885.png" className="w-[30rem] object-contain" />
                <h1 className="text-4xl text-muted-foreground font-medium">Uh-oh! Looks like we can't keep up with you!</h1>
                <p className="text-xl text-muted-foreground font-extralight">Try removing some of the filters</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex rounded-xl border-2 shadow-lg bg-white dark:bg-dark-4 my-5 transform transition duration-500 ease-in-out">
          <Pagination>
            <PaginationContent
              totalPages={products?.data?.totalPages ?? 0}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </Pagination>
        </div>
      </div>
    </div>
  );
};