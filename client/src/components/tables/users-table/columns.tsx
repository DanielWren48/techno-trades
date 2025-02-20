import { ColumnDef } from "@tanstack/react-table"
import { UserType } from "@/lib/validation"
import { DataTableColumnHeader } from "../shared/data-table-column-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils"
import { first } from 'lodash'
import { ACCOUNT_TYPE, AUTH_TYPE } from "@/types"
import { Icons } from "@/components/shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const columns: ColumnDef<UserType>[] = [
  {
    accessorKey: "avatar",
    header: "Avatar",
    cell: ({ row }) => {
      const avatar = row.getValue("avatar") as string
      const firstName = row.getValue("firstName") as string
      const lastName = row.getValue("lastName") as string
      return (
        avatar !== undefined ?
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={avatar}
              alt="AR"
              className="object-cover"
            />
            <AvatarFallback>{first(firstName)}{first(lastName)}</AvatarFallback>
          </Avatar>
          :
          <Avatar>
            <AvatarFallback>{first(firstName)}{first(lastName)}</AvatarFallback>
          </Avatar>
      )
    },
  },
  {
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "lastName",
    header: "LastName",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Member Since" />
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string
      return (
        <div className="flex space-x-2 ml-2">
          <span>{formatDate(createdAt, "year-month")}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "accountType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Account" />
    ),
    cell: ({ getValue }) => {
      const accountType = getValue() as ACCOUNT_TYPE
      return (
        <div className="flex space-x-2 ml-2">
          {accountType === ACCOUNT_TYPE.STAFF && <span className="capitalize inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-sm font-medium text-orange-700 ring-1 ring-inset ring-orange-700/10">{accountType}</span>}
          {accountType === ACCOUNT_TYPE.BUYER && <span className="capitalize inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-sm font-medium text-purple-800 ring-1 ring-inset ring-purple-600/20">{accountType}</span>}
        </div>
      )
    },
  },
  {
    accessorKey: "authType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Auth" />
    ),
    cell: ({ getValue }) => {
      const authType = getValue() as AUTH_TYPE
      return (
        <div className="flex space-x-2 ml-2">
          {authType === AUTH_TYPE.GOOGLE && <Button size={"icon"}><Icons.google className="w-5" /></Button>}
          {authType === AUTH_TYPE.PASSWORD && <Button size={"icon"}><Icons.password className="w-5" /></Button>}
        </div>
      )
    },
  },
  {
    accessorKey: "isEmailVerified",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Verified" />
    ),
    cell: ({ getValue }) => {
      const isEmailVerified = getValue() as boolean
      return (
        <div>
          {isEmailVerified ? <Button size={"icon"}><Icons.check className="w-5" /></Button> : <Button size={"icon"}><Icons.X className="w-5" /></Button>}
        </div>
      )
    },
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actice" />
    ),
    cell: ({ row, getValue }) => {
      const isActive = getValue() as boolean
      return (
        <div>
          {isActive ? <Button size={"icon"}><Icons.check className="w-5" /></Button> : <Button size={"icon"}><Icons.X className="w-5" /></Button>}
        </div>
      )
    },
  },
]