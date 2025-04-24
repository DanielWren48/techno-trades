import { Fragment } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useGetOrders } from "@/api/queries/order";
import { Header } from "@/components/dashboard/header";

export default function Table() {
  const { data, isLoading } = useGetOrders();
  const orders = data?.data?.orders

  return (
    <Fragment>
      <Header
        title="Orders"
        description="Manage all existing orders."
        size="default"
        className="flex flex-row justify-between items-center bg-accent rounded-lg px-8 py-4 mt-6"
      />
      <DataTable columns={columns} data={orders!} loading={isLoading} />
    </Fragment>
  );
}
