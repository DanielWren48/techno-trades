import { GridProductList } from "@/components/shared";
import { ProductLoader } from "@/components/product-filters";
import { useFilterProducts } from "@/api/queries/product";

const Deals = () => {
  const { data, isPending: isProductLoading } = useFilterProducts(
    {
      filters: { discounted: true },
      params: { limit: 999 }
    }
  );

  if (data && data.data && data.data.itemsCount === 0) {
    return <div> No products found </div>;
  }

  return (
    <div className="flex flex-col flex-1 items-center">
      <div className="w-full px-2.5 md:px-10 my-20 max-w-screen-2xl">
        <div className="flex flex-row">
          {isProductLoading ? (
            <ProductLoader displayType="grid" />
          ) : (
            <GridProductList products={data?.data?.items!} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Deals;