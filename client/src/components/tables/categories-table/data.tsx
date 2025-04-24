import { Fragment } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Icons } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/dashboard/header";
import { useGetCategories } from "@/api/queries/category";
import CreateCategoryDialog from "@/_dashboard/components/category/create-category-form";

export default function CategoriesTable() {
  const { data, isLoading } = useGetCategories();
  const categories = data?.data

  return (
    <Fragment>
      <Header
        title="Categories"
        description="Create & Manage all existing categories."
        size="default"
        className="flex flex-row justify-between items-center bg-accent rounded-lg px-8 py-4 mt-6"
      >
        <CreateCategoryDialog
          successCallback={() => console.log("first")}
          trigger={
            <Button className="gap-2 text-sm max-w-sm" size={"lg"}>
              <Icons.add className="w-6 h-6 mr-2" />
              Create category
            </Button>
          } />
      </Header>
      <DataTable columns={columns} data={categories} loading={isLoading} />
    </Fragment>
  );
}
