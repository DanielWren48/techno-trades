import { ColumnDef } from "@tanstack/react-table"
import { ReviewType } from "@/lib/validation"
import { DataTableColumnHeader } from "../shared/data-table-column-header"
import { formatDate, ratingStyle } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { first } from "lodash"
import "@smastrom/react-rating/style.css";
import { Rating } from "@smastrom/react-rating";

export const columns: ColumnDef<ReviewType>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "comment",
    header: "Comment",
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
          <span>{formatDate(createdAt, "year-month")}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "userFirstName",
    header: "First Name",
  },
  {
    accessorKey: "userLastName",
    header: "Last Name",
  },
  {
    accessorKey: "userAvatar",
    header: "Avatar",
    cell: ({ row }) => {
      const avatar = row.getValue("userAvatar") as string
      const firstName = row.getValue("userFirstName") as string
      const lastName = row.getValue("userLastName") as string
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
]