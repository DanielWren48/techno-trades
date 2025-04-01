import { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icons } from "@/components/shared";
import { useState } from "react";
import { orderTableSchema } from "@/lib/validation";

import ShippingStatusDialog from "./dialogs/update-shipping-status";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({ row }: DataTableRowActionsProps<TData>) {
  const [dialogContent, setDialogContent] = useState<React.ReactNode | null>(null);
  const [open, setOpen] = useState(false);
  const order = orderTableSchema.parse(row.original);

  const handleDeliveryStatusClick = () => {
    setDialogContent(<ShippingStatusDialog order={order} setOpen={setOpen} />);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => navigator.clipboard.writeText(order.customerId.toString())}
          >
            <Icons.copy className='mr-2 h-4 w-4' />
            Copy Customer ID
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => navigator.clipboard.writeText(order.customerEmail.toString())}
          >
            <Icons.copy className='mr-2 h-4 w-4' />
            Copy Customer Email
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DialogTrigger asChild className="cursor-pointer" onClick={handleDeliveryStatusClick}>
            <DropdownMenuItem>
              <Icons.orderStatus className='mr-2 h-4 w-4' />
              Update Shipping Status
            </DropdownMenuItem>
          </DialogTrigger>

        </DropdownMenuContent>
      </DropdownMenu>
      {dialogContent &&
        <DialogContent>
          <DialogTitle>Update Order Shipping Status</DialogTitle>
          <div className="py-4">
            {dialogContent}
          </div>
        </DialogContent>}
    </Dialog>
  );
}
