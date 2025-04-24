import { useGetProducts } from "@/api/queries/product";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Fragment } from "react";
import { Header } from "@/components/dashboard/header";

export default function ProductsTable() {
  const { data, isLoading } = useGetProducts();
  const products = data?.data?.items

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
    <Fragment>
      <Header
        title="Reviews"
        description="Manage all existing product reviews."
        size="default"
        className="flex flex-row justify-between items-center bg-accent rounded-lg px-8 py-4 mt-6"
      />
      <DataTable columns={columns} data={allReviews} loading={isLoading} />
    </Fragment>
  );
}
