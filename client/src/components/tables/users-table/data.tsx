import { useGetAllUsers } from "@/api/users/queries";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default function UsersTable() {
  const { data, isLoading } = useGetAllUsers();
  const users = data?.data?.users
  
  return(
    <DataTable columns={columns} data={users!} loading={isLoading}/>
  );
}
