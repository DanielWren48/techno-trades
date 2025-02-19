import { Product } from "@/types";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { useBrandFilter } from "@/hooks/store";
import { useGetProducts } from "@/api/products/queries";

const ProductBrandFilter: React.FC = () => {
  const { data } = useGetProducts();
  const products = data?.data?.items
  const { selectedBrands, toggleBrand } = useBrandFilter();
  const uniqueBrands: string[] = Array.from(new Set(products?.map((product: Product) => product.brand).sort() || []));

  return (
    <>
      {uniqueBrands.map((name) => (
        <div
          key={name}
          className="flex flex-row mx-0 my-1 justify-start items-center"
        >
          <Checkbox
            id={name}
            checked={selectedBrands.includes(name)}
            onCheckedChange={() => toggleBrand(name)}
            aria-label={`Select ${name} brand`}
          />
          <Label htmlFor={name} className="ml-2 font-jost text-base dark:text-light-2 transform transition duration-500 ease-in-out">{name}</Label>
        </div>
      ))}
    </>
  );
};

export default ProductBrandFilter;