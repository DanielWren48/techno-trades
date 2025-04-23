import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useGetCategories } from "@/api/queries/category";

export default function CategoriesTable() {
  const { data, isLoading } = useGetCategories();
  const categories = data?.data

  return (
    <DataTable columns={columns} data={categories} loading={isLoading} />
  );
}
