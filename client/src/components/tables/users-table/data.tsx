import { Fragment } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useGetAllUsers } from "@/api/queries/user";
import { Header } from "@/components/dashboard/header";

export default function UsersTable() {
  const { data, isLoading } = useGetAllUsers();
  const users = data?.data?.users

  return (
    <Fragment>
      <Header
        title="Users"
        description="Manage all existing users."
        size="default"
        className="flex flex-row justify-between items-center bg-accent rounded-lg px-8 py-4 mt-6"
      />
      <DataTable columns={columns} data={users!} loading={isLoading} />
    </Fragment>
  );
}
