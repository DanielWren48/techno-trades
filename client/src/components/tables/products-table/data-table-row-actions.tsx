import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogOverlay,
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
import { productTableSchema } from "@/lib/validation";
import DeleteDialog from "./dialogs/delete-dialog";
import ViewDialog from "./dialogs/view-dialog";
import EditDialog from "./dialogs/edit-dialog";
import MediaDialog from "./dialogs/media-dialog";
import SetDiscount from "./dialogs/set-discount";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const [dialogContent, setDialogContent] = useState<React.ReactNode | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const product = productTableSchema.parse(row.original);
  // console.log(row.original)

  const handleViewClick = () => {
    setDialogContent(
      <ViewDialog payment={product} />
    );
  };

  const handleEditClick = () => {
    setDialogContent(
      <EditDialog product={product} setOpen={setOpen} />
    );
  };

  const handleDiscountClick = () => {
    setDialogContent(
      <SetDiscount product={product} setOpen={setOpen} />
    );
  };

  const handleMediaClick = () => {
    setDialogContent(
      <MediaDialog product={product} setOpen={setOpen} />
    );
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
            onClick={() => navigator.clipboard.writeText(product._id!.toString())}
          >
            <Icons.copy className='mr-2 h-4 w-4' />
            Copy Product ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DialogTrigger asChild onClick={handleViewClick}>
            <DropdownMenuItem>
              <Icons.view className='mr-2 h-4 w-4' />
              View Product
            </DropdownMenuItem>
          </DialogTrigger>

          <DialogTrigger asChild onClick={handleEditClick}>
            <DropdownMenuItem>
              <Icons.edit className='mr-2 h-4 w-4' />
              Edit Product
            </DropdownMenuItem>
          </DialogTrigger>

          <DialogTrigger asChild onClick={handleDiscountClick}>
            <DropdownMenuItem>
              <Icons.discount className='mr-2 h-4 w-4' />
              Set Discount
            </DropdownMenuItem>
          </DialogTrigger>

          <DialogTrigger asChild onClick={handleMediaClick}>
            <DropdownMenuItem>
              <Icons.media className='mr-2 h-4 w-4' />
              Edit Media
            </DropdownMenuItem>
          </DialogTrigger>

          <DropdownMenuItem
            onSelect={() => setShowDeleteDialog(true)}
            className='text-red-400'
          >
            <Icons.delete className='mr-2 h-4 w-4' />
            Archive Product
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {dialogContent && <DialogContent className="max-w-screen-lg">{dialogContent}</DialogContent>}
      <DeleteDialog
        product={product}
        isOpen={showDeleteDialog}
        showActionToggle={setShowDeleteDialog}
      />
    </Dialog>
  );
}
