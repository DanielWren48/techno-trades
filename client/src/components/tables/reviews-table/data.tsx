import { useGetProducts } from "@/api/queries/product";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default function ProductsTable() {
  const { data, isLoading } = useGetProducts();
  const products = data?.data?.items

  if (isLoading && !products) {
    return <div>Loading...</div>
  }

  const allReviews = products!
    .filter(product =>
      Array.isArray(product.reviews) &&
      product.reviews.some((review: any) => review && Object.keys(review).length > 0)
    )
    .flatMap(product =>
      product.reviews!
        .filter((review: any) => review && Object.keys(review).length > 0)
        .map(review => ({
          ...review,
          productId: product._id,
          productSlug: product.slug
        }))
    );

  return (
    <DataTable columns={columns} data={allReviews} loading={isLoading} />
  );
}
