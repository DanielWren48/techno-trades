import React from "react"
import { useRef } from "react"
import { toast } from "sonner"
import { X } from "lucide-react"
import { ICategory, ProductImage } from "@/types"
import { Icons } from "@/components/shared"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ProductType } from "@/lib/validation"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import BulkActionsDropdown from "./data-table-bulk-actions"
import { DataTableRowActions } from "./data-table-row-actions"
import { TableCellViewer } from "./components/TableCellViewer"
import { DataTableColumnHeader } from "../shared/data-table-column-header"
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
    accessorFn: (row) => {
      //@ts-expect-error
      return row.category?.parent?.slug || '';
    },
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <div className="flex w-fit items-center pl-1 text-lg">
        {/* @ts-expect-error */}
        <span>{row.original.category.parent.name}</span>
      </div>
    ),
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
    accessorKey: "discountPercentage",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Discount" />
    ),
    cell: ({ row }) => {
      const discount = row.getValue("discountPercentage") as number || undefined;

      return <TableCellViewer
        product={row.original}
        initialTab="discount"
        trigger={
          <div className="flex space-x-2 ml-2 cursor-pointer">
            {discount === undefined && <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-sm font-medium text-yellow-700 ring-1 ring-inset ring-yellow-700/10"><X /></span>}
            {discount && <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-800 ring-1 ring-inset ring-green-600/20">{discount}%</span>}
          </div>
        }
      />
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "image",
    header: "Media",
    cell: ({ row }) => {
      const images = row.getValue("image") as ProductImage[];

      return <TableCellViewer
        product={row.original}
        initialTab="image"
        trigger={
          <div className="relative select-none flex items-center justify-center w-fit cursor-pointer">
            <span className="absolute -top-1 right-1 bg-gray-100 text-foreground text-xs font-semibold px-1.5 py-0.5 rounded-full">
              {images.length}
            </span>
            <Icons.media className="w-14" />
          </div>
        }
      />
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
      const inputRef = useRef<HTMLInputElement>(null);

      const { mutateAsync } = useUpdateProduct();

      const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        //@ts-expect-error
        let raw = event.target.price.value.trim().replace(/[£,]/g, "");
        let newPrice = Number(raw);

        toast.promise(mutateAsync({ id: row.original._id!, price: newPrice }), {
          loading: `Updating price to ${newPrice}`,
          success: "Updated Succesfully",
          error: "Error",
        })
        inputRef.current?.blur();
      }

      return (
        <form onSubmit={handleSubmit}>
          <Label htmlFor={`${row.original._id}-price`} className="sr-only">
            New Price
          </Label>
          <Input
            className="h-8 w-24 border-transparent bg-transparent text-center shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background"
            defaultValue={formatted}
            id={`${row.original._id}-price`}
            ref={inputRef}
            name="price"
          />
        </form>
      )
    },
  },
  {
    accessorKey: "stock",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stock" />
    ),
    cell: ({ row }) => {
      const { mutateAsync } = useUpdateProductStock();
      const inputRef = useRef<HTMLInputElement>(null);

      const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        //@ts-expect-error
        const newStock = Number(event.target.stock.value)

        toast.promise(mutateAsync({ id: row.original._id!, stockChange: newStock }), {
          loading: `Updating stock to ${newStock}`,
          success: "Updated Succesfully",
          error: "Error",
        })
        inputRef.current?.blur();
      }

      return (
        <form onSubmit={handleSubmit}>
          <Label htmlFor={`${row.original._id}-stock`} className="sr-only">
            New Stock
          </Label>
          <Input
            className="h-8 w-20 border-transparent bg-transparent text-center shadow-none hover:bg-input/30 focus-visible:border focus-visible:bg-background"
            defaultValue={row.original.stock}
            id={`${row.original._id}-stock`}
            ref={inputRef}
            type="number"
            name="stock"
          />
        </form>
      )
    },
  },
  {
    id: "actions",
    header: ({ table }) => {
      const selectedRows = React.useMemo(() => {
        return table.getFilteredSelectedRowModel().rows;
      }, [table.getFilteredSelectedRowModel().rows]);

      const handleBulkDelete = async () => {
        if (selectedRows.length === 0) return;

        try {
          const productIds = selectedRows.flatMap(row => row.original._id);

          console.log(productIds)
          table.resetRowSelection();
        } catch (error) {
          toast.error("An error occurred while deleting products");
          console.error("Bulk delete error:", error);
        }
      };

      return (
        <BulkActionsDropdown
          selectedRows={selectedRows}
          onArchiveSelected={handleBulkDelete}
          onClearSelection={() => table.resetRowSelection()}
        />
      )
    },
    cell: ({ row }) => <DataTableRowActions row={row} />
  },
]