import { useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { useDebounce } from 'use-debounce';
import { usePriceFilter } from '@/hooks/store';

const ProductPriceFilter = () => {
  const { min, max, setPriceRange, setDebouncedPriceRange } = usePriceFilter();

  const [debouncedMin] = useDebounce(min, 1000);
  const [debouncedMax] = useDebounce(max, 1000);

  useEffect(() => {
    setDebouncedPriceRange(debouncedMin, debouncedMax);
  }, [debouncedMin, debouncedMax, setDebouncedPriceRange]);

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values[0], values[1]);
  };

  return (
    <div className="space-y-4 py-3 px-1">
      <div className="mb-6">
        <Slider
          value={[min, max]}
          max={1200}
          step={10}
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
    </div>
  );
};

export default ProductPriceFilter