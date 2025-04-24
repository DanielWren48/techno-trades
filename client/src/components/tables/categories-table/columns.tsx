import { useRef } from "react"
import { toast } from "sonner"
import { X } from "lucide-react"
import { ProductImage } from "@/types"
import { Icons } from "@/components/shared"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CategoryType, ProductType } from "@/lib/validation"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "../shared/data-table-column-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUpdateProduct, useUpdateProductStock } from "@/api/queries/product"
import { formatDate } from "@/lib/utils"
import { TableCellViewer } from "./components/TableCellViewer"
import { DataTableRowActions } from "./data-table-row-actions"

export const columns: ColumnDef<CategoryType>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return <TableCellViewer category={row.original} />
    },
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "productCount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Products" />
    ),
    cell: ({ row }) => {
      const productCount = row.getValue("productCount") as number;
      return (
        <div className="flex space-x-2 ml-2 cursor-pointer text-center">
          <span className="inline-flex items-center rounded-md bg-yellow-50 py-2 px-4 text-xl font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">{productCount}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date created" />
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
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date updated" />
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue("updatedAt") as string
      return (
        <div className="flex space-x-2 ml-2">
          <span>{formatDate(createdAt, "long")}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "icon",
    header: "Icon",
    cell: ({ row }) => {
      const icon = row.getValue("icon") as string;
      return (
        <div className="flex space-x-2 ml-2 text-center">
          <span className="inline-flex items-center rounded-md bg-green-50 w-16 h-12 text-center justify-center text-3xl font-medium text-green-800 ring-1 ring-inset ring-green-600/20">{icon}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => {
      const image = row.getValue("image") as string
      return (
        <Avatar className="h-16 w-16 rounded-md">
          <AvatarImage
            src={image}
            alt={row.original.slug}
            className="object-cover"
          />
          <AvatarFallback>{row.original.slug}</AvatarFallback>
        </Avatar>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />
  },
]