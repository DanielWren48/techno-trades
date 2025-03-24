import { ColumnDef } from "@tanstack/react-table"
import { OrderType } from "@/lib/validation"
import { DataTableColumnHeader } from "../shared/data-table-column-header"
import { PaymentMethodDetails } from "@/types/order"
import { Icons } from "@/components/shared";
import { DataTableRowActions } from "./data-table-row-actions"

export const columns: ColumnDef<OrderType>[] = [
  {
    accessorKey: "orderNumber",
    header: "Order №",
    cell: ({ row }) => {
      const orderNumber = row.getValue("orderNumber") as string
      return (
        <div className="flex items-center text-center flex-row gap-2">
          <div className="font-semibold">{orderNumber.slice(12)}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "customerEmail",
    header: "Customer",
  },
  {
    accessorKey: "paymentIntentDetails",
    header: "Payment method",
    cell: ({ row }) => {
      const paymentIntentDetails = row.getValue("paymentIntentDetails") as PaymentMethodDetails;
      const card = paymentIntentDetails.card

      return (
        <div className="flex flex-row gap-1 my-1">
          <Icons.visa className="w-12 border p-1 bg-black/10 rounded-sm" />
          <p>
            <span className="font-sans" aria-hidden="true">••••</span>
            {card.last4}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "GBP",
      }).format(amount / 100)

      return <div className="font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Order Date" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      const formatted = new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);

      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "deliveryStatus",
    header: "Shipping",
    cell: ({ row }) => {
      const deliveryStatus = row.getValue("deliveryStatus");
      const isPending = deliveryStatus === "pending";
      const isShipped = deliveryStatus === "shipped";
      const isDelivered = deliveryStatus === "delivered";

      return (
        <div className="flex space-x-2">
          {isPending && <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-sm font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Pending</span>}
          {isShipped && <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">Shipped</span>}
          {isDelivered && <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Delivered</span>}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const paymentStatus = row.getValue("paymentStatus") as string;
      const success = paymentStatus === "succeeded";
      const fail = paymentStatus === "failed";

      return (
        <div className="flex space-x-2">
          {success && <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Paid</span>}
          {fail && <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-sm font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Unpaid</span>}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row}/>
  },
]