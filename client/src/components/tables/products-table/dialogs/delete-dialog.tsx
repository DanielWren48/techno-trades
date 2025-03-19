import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProductType } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"

type DeleteProps = {
  product: ProductType;
  isOpen: boolean;
  showActionToggle: (open: boolean) => void;
};

export default function DeleteDialog({ product, isOpen, showActionToggle }: DeleteProps) {

  // const { mutateAsync: archiveProduct } = useArchiveProduct();

  async function handleEvent() {
    showActionToggle(false);

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
    <AlertDialog open={isOpen} onOpenChange={showActionToggle}>
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
  );
}
