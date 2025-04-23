import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { useCategoryFilter } from "@/hooks/store";
// import { categoriesValues } from "@/constants/idnex";
import { useGetCategories } from "@/api/queries/category";

const ProductCategoryFilter = () => {
  const { selectedCategories, toggleCategory } = useCategoryFilter();

  const { data, isLoading, refetch } = useGetCategories();

  const categories = data?.data

  if (categories === undefined || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {categories.sort().map((category) => (
        <div
          key={category._id}
          className="flex flex-row mx-0 my-1 justify-start items-center"
        >
          <Checkbox
            id={category._id}
            checked={selectedCategories.includes(category._id)}
            onCheckedChange={() => toggleCategory(category._id)}
          />
          <Label htmlFor={category._id} className="ml-2 capitalize font-jost text-base dark:text-light-2 transform transition duration-500 ease-in-out">
            {category.name}
          </Label>
        </div>
      ))}
    </>
  );
};

export default ProductCategoryFilter;
