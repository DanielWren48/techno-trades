import { ColumnDef } from "@tanstack/react-table"
import { ReviewType } from "@/lib/validation"
import { DataTableColumnHeader } from "../shared/data-table-column-header"
import { formatDate, ratingStyle } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { first } from "lodash"
import "@smastrom/react-rating/style.css";
import { Rating } from "@smastrom/react-rating";
import { TableCellViewer } from "./components/TableCellViewer"
import { DataTableRowActions } from "./data-table-row-actions"

export const columns: ColumnDef<ReviewType>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      return <TableCellViewer review={row.original} />
    },
  },
  {
    accessorKey: "rating",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rating" />
    ),
    cell: ({ row }) => {
      const rating = row.getValue("rating") as number
      return (
        <Rating
          value={rating}
          readOnly
          className="max-w-[100px]"
          itemStyles={ratingStyle}
        />
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created On" />
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string
      return (
        <div className="flex space-x-2 ml-2">
          <span>{formatDate(createdAt, "long")}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "userAvatar",
    header: "Created By",
    cell: ({ row }) => {
      const avatar = row.getValue("userAvatar") as string
      const firstName = row.original.userFirstName
      const lastName = row.original.userLastName
      return (
        <div className="flex flex-row gap-3 text-center m-auto content-center items-center align-middle">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={avatar}
              alt="AR"
              className="object-cover"
            />
            <AvatarFallback>{first(firstName)}{first(lastName)}</AvatarFallback>
          </Avatar>
          <h1>{firstName} {lastName}</h1>
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />
  },
]