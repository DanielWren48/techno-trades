import { Fragment } from "react";
import { columns } from "./columns";
import { Link } from "react-router-dom";
import { DataTable } from "./data-table";
import { Icons } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";
import { Header } from "@/components/dashboard/header";
import { useGetProducts } from "@/api/queries/product";

export default function ProductsTable() {
  const { data, isLoading } = useGetProducts();
  const products = data?.data?.items

  return (
    <Fragment>
      <Header
        title="Products"
        description="Create & Manage all existing products."
        size="default"
        className="flex flex-row justify-between items-center bg-accent rounded-lg px-8 py-4 mt-6"
      >
        <Link to="/dashboard/new-product" className={buttonVariants({ size: "lg" })}>
          <Icons.add className="w-6 h-6 mr-2" />
          Create product
        </Link>
      </Header>
      <DataTable columns={columns} data={products!} loading={isLoading} />
    </Fragment>
  );
}
