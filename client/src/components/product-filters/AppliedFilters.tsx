import {
  useCategoryFilter,
  useBrandFilter,
  usePriceFilterStore,
  useRatingFilterStore,
} from "@/hooks/store";
import { Button } from "../ui/button";
import { Star, X } from "lucide-react";
import { priceRanges } from "@/constants/idnex";
import { useGetCategories } from "@/api/queries/category";

const AppliedFilters = () => {
  //-------------------------------BRANDS-----------------------------------------------------
  const { selectedBrands, removeBrand, removeAllBrands } = useBrandFilter();
  //-------------------------------PRICES-----------------------------------------------------
  const { selectedRanges, removeSelectedRange, removeAllRanges } = usePriceFilterStore();
  //-------------------------------RATING-----------------------------------------------------
  const { selectedRatings, removeSelectedRating, removeAllRatings } = useRatingFilterStore();
  //-------------------------------CATEGORY-----------------------------------------------------
  const { selectedCategories, removeCategory, removeAllCategories } = useCategoryFilter();;

  const { data } = useGetCategories();
  const categories = data?.data

  function clearAllFilter() {
    selectedBrands.length !== 0 && removeAllBrands();
    selectedRanges.length !== 0 && removeAllRanges();
    selectedRatings.length !== 0 && removeAllRatings();
    selectedCategories.length !== 0 && removeAllCategories();
  }
  return (
    <div>
      {(selectedRanges.length !== 0 ||
        selectedBrands.length !== 0 ||
        selectedRatings.length !== 0 ||
        selectedCategories.length !== 0) && (
        <div className="flex flex-wrap font-jost">
          {selectedRanges.length !== priceRanges.length ? selectedRanges.map(({ min, max }, idx) => (
            <div key={`range-${idx}`} className="flex items-center mb-2 mr-1">
              <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-base font-medium text-purple-800 ring-1 ring-inset ring-purple-600/20">
                {`£${min} to £${max}`}
                <X
                  className="cursor-pointer ml-1 text-black"
                  onClick={() => removeSelectedRange(min, max)}
                />
              </span>
            </div>
          )) : 
          <div className="mb-2 mr-1">
            <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-base font-medium text-purple-800 ring-1 ring-inset ring-purple-600/20">
              Any Price
              <X className="cursor-pointer ml-1 text-black" onClick={() => removeAllRanges()} />
            </span>
          </div>
          }
          {selectedCategories.length !== categories?.length ? selectedCategories.map((category, idx) => (
            <div key={`category-${idx}`} className="flex items-center mb-2 mr-1">
              <span className="inline-flex items-center rounded-md capitalize bg-purple-50 px-2 py-1 text-base font-medium text-purple-800 ring-1 ring-inset ring-purple-600/20">
                {categories?.find(c => c._id === category)?.name}
                <X
                  className="cursor-pointer ml-1 text-black"
                  onClick={() => removeCategory(category)}
                />
              </span>
            </div>
          )) :           
          <div className="mb-2 mr-1">
            <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-base font-medium text-purple-800 ring-1 ring-inset ring-purple-600/20">
              Any Category
              <X className="cursor-pointer ml-1 text-black" onClick={() => removeAllCategories()} />
            </span>
          </div>
          }
          {selectedBrands.length !== 99 ? selectedBrands.map((brand, idx) => (
            <div key={`brand-${idx}`} className="flex items-center mb-2 mr-1">
              <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-base font-medium text-purple-800 ring-1 ring-inset ring-purple-600/20">
                {brand}
                <X
                  className="cursor-pointer ml-1 text-black"
                  onClick={() => removeBrand(brand)}
                />
              </span>
            </div>
          )) : 
          <div className="mb-2 mr-1">
            <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-base font-medium text-purple-800 ring-1 ring-inset ring-purple-600/20">
              Any Brand
              <X className="cursor-pointer ml-1 text-black" onClick={() => removeAllBrands()} />
            </span>
          </div>
          }
          {selectedRatings.length !== 5 ? selectedRatings.map((rating, idx) => (
            <div key={`rating-${idx}`} className="flex items-center mb-2 mr-1">
              <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-base font-medium text-purple-800 ring-1 ring-inset ring-purple-600/20">
                <Star className="fill-yellow-400 text-yellow-500 mr-1" />
                {rating} or more
                <X
                  className="cursor-pointer ml-1 text-black"
                  onClick={() => removeSelectedRating(rating)}
                />
              </span>
            </div>
          )) : 
          <div className="mb-2 mr-1">
            <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-base font-medium text-purple-800 ring-1 ring-inset ring-purple-600/20">
              Any Rating
              <X className="cursor-pointer ml-1 text-black" onClick={() => removeAllRatings()} />
            </span>
          </div>
          }
        </div>
      )}
      {selectedBrands.length + selectedRanges.length + selectedRatings.length + selectedCategories.length > 3 && (
        <Button className="w-full font-jost text-base font-medium" onClick={clearAllFilter}>
        Clear All
        </Button>
      )}
    </div>
  );
};

export default AppliedFilters;