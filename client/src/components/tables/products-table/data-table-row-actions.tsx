import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { Icons } from "@/components/shared";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { productTableSchema } from "@/lib/validation";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTableRowActions<TData>({ row }: DataTableRowActionsProps<TData>) {
  const [open, setOpen] = useState<boolean>(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const product = productTableSchema.parse(row.original);

  // const { mutateAsync: archiveProduct } = useArchiveProduct();

  async function handleEvent() {
    setShowDeleteDialog(false);

    // const res = await archiveProduct(product._id)
    // toast.success(res.message)

    // if (product.image.length > 0) {

    //   const imageKeys: string[] = product.image.map((image) => image.key);
    //   toast.promise(
    //     () => new Promise<void>((resolve) => {
    //       setTimeout(() => {
    //         deleteMediaFilesByKey(imageKeys as []);
    //         resolve();
    //       }, 2000);
    //     }),
    //     {
    //       loading: 'Deleting Files...',
    //       success: () => 'Successfully Deleted.',
    //       error: () => 'Error deleting files.',
    //     }
    //   );

    //   // toast.promise(() => deleteMediaFilesByKey(imageKeys as []),
    //   //   {
    //   //     loading: 'Deleting Files...',
    //   //     success: () => { return 'Successfully Deleted.' },
    //   //     error: () => { return 'Error deleting files.' },
    //   //   }
    //   // );
    // }
  }

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

          <DropdownMenuItem
            onSelect={() => setShowDeleteDialog(true)}
            className='text-red-400'
          >
            <Icons.delete className='mr-2 h-4 w-4' />
            Archive Product
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to archive the{" "}
              <b>{product.name}</b>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => { handleEvent() }}
            >
              Archive
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
