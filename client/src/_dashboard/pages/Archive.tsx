import { Shell } from "@/components/dashboard/shell";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/dashboard/header";
import { useGetProducts } from "@/api/queries/product";
import { columns } from "@/components/tables/products-table/columns";
import { DataTable } from "@/components/tables/products-table/data-table";

export default function ArchivedProductsTable() {
    const { data, isLoading } = useGetProducts();
    const products = data?.data?.items

    return (
        <Shell>
            <Header
                title="Archive"
                description="Manage all the Archived prioducts here."
            />
            <Separator />
            <DataTable columns={columns} data={products!} loading={isLoading} />
        </Shell>
    );
}
