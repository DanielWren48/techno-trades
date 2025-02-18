import { useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { useDebounce } from 'use-debounce';
import { usePriceFilter } from '@/hooks/store';
import { useGetProducts } from '@/api/products/queries';
import { RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';

const ProductPriceFilter = () => {
  const { data: productsData } = useGetProducts();
  const { min, max, productPriceRange, setPriceRange, setDebouncedPriceRange, initializePriceRange, isInitialized, resetPriceRange } = usePriceFilter();

  const [debouncedMin] = useDebounce(min, 500);
  const [debouncedMax] = useDebounce(max, 500);

  useEffect(() => {
    if (productsData?.data?.items && !isInitialized) {
      const products = productsData.data.items;
      const prices = products.map(product =>
        product.isDiscounted && product.discountedPrice
          ? product.discountedPrice
          : product.price
      );

      const minPrice = Math.floor(Math.min(...prices));
      const maxPrice = Math.ceil(Math.max(...prices));

      initializePriceRange(minPrice, maxPrice);
    }
  }, [productsData, initializePriceRange, isInitialized]);

  useEffect(() => {
    setDebouncedPriceRange(debouncedMin, debouncedMax);
  }, [debouncedMin, debouncedMax, setDebouncedPriceRange]);

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values[0], values[1]);
  };

  return (
    <div className="space-y-4 py-3 px-1 w-full">
      <div className="mb-6">
        <Slider
          value={[min, max]}
          min={productPriceRange.min}
          max={productPriceRange.max}
          step={1}
          onValueChange={handlePriceChange}
        />
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm">
          <span className="font-medium">Min: </span>
          <span className="text-muted-foreground">${min}</span>
        </div>
        <div className="text-sm">
          <span className="font-medium">Max: </span>
          <span className="text-muted-foreground">${max}</span>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={resetPriceRange}
        disabled={min === productPriceRange.min && max === productPriceRange.max}
        className="h-8 px-2 w-full"
      >
        <RotateCcw className="h-4 w-4" />
        <span className="ml-2">Reset</span>
      </Button>
    </div>
  );
};

export default ProductPriceFilter;