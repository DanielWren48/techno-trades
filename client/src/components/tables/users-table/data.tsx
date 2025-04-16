import { useGetAllUsers } from "@/api/queries/user";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default function UsersTable() {
  const { data, isLoading } = useGetAllUsers();
  const users = data?.data?.users

  return (
    //@ts-expect-error
    <DataTable columns={columns} data={users} loading={isLoading} />
  );
}
