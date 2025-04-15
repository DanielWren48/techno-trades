import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { categories } from "./filters"
import { DataTableRowActions } from "./data-table-row-actions"
import { ProductType } from "@/lib/validation"
import { DataTableColumnHeader } from "../shared/data-table-column-header"
import { X } from "lucide-react"
import { TableCellViewer } from "./components/TableCellViewer"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useUpdateProduct, useUpdateProductStock } from "@/api/queries/product"

export const columns: ColumnDef<ProductType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = categories.find(
        (category) => category.value === row.getValue("category")
      )

      if (!category) {
        return null
      }

      return (
        <div className="flex w-[130px] items-center pl-1">
          {category.icon && (
            <category.icon className="mr-2 h-6 w-6 text-muted-foreground" />
          )}
          <span>{category.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return <TableCellViewer product={row.original} />
    },
  },
  {
    accessorKey: "brand",
    header: "Brand",
  },
  {
    accessorKey: "discountPercentage",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Discount" />
    ),
    cell: ({ row }) => {
      const discount = row.getValue("discountPercentage") as number || undefined;

      return (
        <div className="flex space-x-2 ml-2">
          {discount === undefined && <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-sm font-medium text-yellow-700 ring-1 ring-inset ring-yellow-700/10"><X /></span>}
          {discount && <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-800 ring-1 ring-inset ring-green-600/20">{discount}%</span>}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "GBP",
      }).format(amount)

      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "countInStock",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stock" />
    ),
    cell: ({ row }) => {
      const { mutateAsync } = useUpdateProductStock();

      const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        //@ts-expect-error
        const newStock = Number(event.target.stock.value)

        toast.promise(mutateAsync({ id: row.original._id!, stockChange: newStock }), {
          loading: `Updating stock to ${newStock}`,
          success: "Updated Succesfully",
          error: "Error",
        })
      }

      return (
        <form onSubmit={handleSubmit}>
          <Label htmlFor={`${row.original._id}-stock`} className="sr-only">
            New Stock
          </Label>
          <Input
            className="h-8 w-16 border-transparent bg-transparent text-right shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background"
            defaultValue={row.original.countInStock}
            id={`${row.original._id}-stock`}
            type="number"
            name="stock"
          />
        </form>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />
  },
]