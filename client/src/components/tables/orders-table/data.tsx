import { useGetOrders } from "@/api/orders/queries";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default function Table() {
  const { data, isLoading } = useGetOrders();
  const orders = data?.data?.orders

  return isLoading ? (
    <>
      <h1>loading</h1>
    </>
  ) : (
    orders && <DataTable columns={columns} data={orders} />
  );
}
