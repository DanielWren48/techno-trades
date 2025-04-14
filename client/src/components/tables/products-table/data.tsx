import { useGetProducts } from "@/api/queries/product";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default function ProductsTable() {
  const { data, isLoading } = useGetProducts();
  const products = data?.data?.items

  return (
    <DataTable columns={columns} data={products!} loading={isLoading} />
  );
}
