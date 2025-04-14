import { useGetProducts } from "@/api/queries/product";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default function ProductsTable() {
  const { data, isLoading } = useGetProducts();
  const products = data?.data?.items

  const reviews = products!
    .flatMap(product => product.reviews)
    .filter(review =>
      review &&
      Object.keys(review).length > 0 &&
      review.rating !== undefined
    );

  return (
    <DataTable columns={columns} data={reviews} loading={isLoading} />
  );
}
