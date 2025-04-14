import { useGetAllUsers } from "@/api/queries/user";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default function UsersTable() {
  const { data, isLoading } = useGetAllUsers();
  const users = data?.data
  
  return(
    <DataTable columns={columns} data={users!} loading={isLoading}/>
  );
}
