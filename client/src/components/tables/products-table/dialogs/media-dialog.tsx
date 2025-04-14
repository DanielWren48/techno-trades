import { ProductType } from "@/lib/validation";
import { useCallback, useState } from "react";
import { useDropzone } from "@uploadthing/react/hooks";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { FileWithPath } from "@uploadthing/react";
import { useUploadThing } from "@/uploadthing";
import { cn, convertFileToUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { ProductImage } from "@/types";
import { Progress } from "@/components/ui/progress";
import { useUpdateProduct } from "@/api/queries/product";
import { mediaApiEndpoints } from "@/api/client";

type MediaProps = {
  product: ProductType;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function MediaDialog({ product, setOpen }: MediaProps) {

  const imageUrls: string[] = product.image.map((image) => image.url);
  const [currentFileUrls, setCurentFileUrls] = useState<string[]>(imageUrls);
  const [newFileUrl, setNewFileUrls] = useState<string[]>([]);
  const [DeleteFileUrl, setDeleteFileUrls] = useState<string[]>([]);
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const { mutateAsync: updateProduct } = useUpdateProduct();

  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    const newFiles = [...files, ...acceptedFiles];
    const newFileUrls = newFiles.map(convertFileToUrl);

    setNewFileUrls(newFileUrls);
    setFiles([...files, ...acceptedFiles]);
  }, [files]);

  const { startUpload, isUploading, permittedFileInfo, } = useUploadThing("videoAndImage", {
    onClientUploadComplete: () => {
      toast.success("Uploaded images successfully!", {
        id: "uploading",
      });
    },
    onUploadError: (error: Error) => {
      toast.error(error.message, {
        id: "uploading",
      });
    },
    onUploadBegin: () => {
      toast.loading("Uploading images...", {
        id: "uploading",
      });
    },
    onUploadProgress: (progress: number) => setUploadProgress(progress),
  });

  const fileTypes = permittedFileInfo?.config ? Object.keys(permittedFileInfo?.config) : [];

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: fileTypes ? generateClientDropzoneAccept(fileTypes) : undefined,
  });

  function handleRemoveCurrent(index: number) {
    // Remove the image from current state
    const updatedCurrentFileUrls = [...currentFileUrls];
    const removedImage = updatedCurrentFileUrls.splice(index, 1)[0];

    // Add the removed image to delete state
    setDeleteFileUrls([...DeleteFileUrl, removedImage]);
    setCurentFileUrls(updatedCurrentFileUrls);
  }

  function handleRemoveNewFile(index: number) {
    // Remove the image from new file state
    const updatedNewFileUrls = [...newFileUrl];
    updatedNewFileUrls.splice(index, 1);

    // Remove the corresponding file from the files state
    const updatedFiles = files.filter((_, i) => i !== index);

    setNewFileUrls(updatedNewFileUrls);
    setFiles(updatedFiles);
  }

  const restoreDeletedImage = (index: number) => {
    // Remove the image from delete state
    const updatedDeleteFileUrls = [...DeleteFileUrl];
    const restoredImage = updatedDeleteFileUrls.splice(index, 1)[0];

    // Add the restored image back to the current state
    setCurentFileUrls([...currentFileUrls, restoredImage]);
    setDeleteFileUrls(updatedDeleteFileUrls);
  };

  const handleSubmit = async () => {
    let updatedProduct = { ...product };

    if (DeleteFileUrl.length > 0) {
      // If there are images to delete
      const keysToDelete = DeleteFileUrl.map((imageUrl) => {
        const parts = imageUrl.split('/');
        return parts[parts.length - 1];
      });

      toast.promise(() => mediaApiEndpoints.deleteFiles([...keysToDelete]),
        {
          loading: 'Removing file...',
          success: () => 'File deleted succesfully',
          error: () => 'Error deleting files.',
        }
      );

      // Update the product without the deleted images
      updatedProduct = {
        ...updatedProduct,
        image: updatedProduct.image.filter((img) => !keysToDelete.includes(img.key)),
      };
    }

    if (newFileUrl.length > 0) {
      // If there are new images
      const renamedFiles = files.map((file) => {
        // Generate a random index for each file
        const randomIndex = Math.floor(Math.random() * 1000);

        // Extract file extension
        const fileExtension = file.name.split('.').pop();

        // Generate the new file name based on the product name and the random index
        const newFileName = `${product.name.replace(/\s/g, '_')}_${randomIndex}.${fileExtension}`;

        // Create a new File object with the modified name
        return new File([file], newFileName, { type: file.type });
      });

      // Perform the actual upload with the renamed files
      const UploadFileResponse = await startUpload(renamedFiles);

      const productImages: ProductImage[] = UploadFileResponse!.map((imageData) => ({
        key: imageData.key as string,
        name: imageData.name as string,
        url: imageData.url as string,
      }));

      // Update the product with the new images
      updatedProduct = {
        ...updatedProduct,
        image: [...updatedProduct.image, ...productImages],
      };
    }

    // Add the logic to update the product in the database
    const { status, message } = await updateProduct({ id: updatedProduct._id!, ...updatedProduct });
    if (status === "success") {
      toast.success(message)
    } else if (status === "failure") {
      toast.error(message)
    } else {
      toast.info(message)
    }
    setOpen?.(false);
  };

  return (
    <div className="flex justify-center items-center flex-col border rounded-xl m-1">
      <div
        {...getRootProps()}
        className="cursor-pointer max-h-[300px] w-full"
      >
        <input {...getInputProps()} className="cursor-pointer" />
        <div className="flex justify-center items-center flex-col p-7 h-80 lg:h-[200px]">
          <h3 className="base-medium text-dark-4 text-lg mb-2 mt-6">Drag or Drop photos here</h3>
          <p className="text-light-4 small-regular mb-6">PNG, JPEG, JPG</p>

          <Button
            type="button"
            variant={"secondary"}
            disabled={isUploading}
            className="h-12 border-4"
          >
            Select from computer
          </Button>
        </div>
      </div>

      {currentFileUrls.length !== 0 &&
        <div className="w-full border-t-4">
          <h1 className="w-full bg-gray-00 text-center text-lg font-semibold leading-loose">Current Product Images</h1>
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-4  p-4">
            {currentFileUrls.map((fileUrl, index) => (
              <div key={index} className="relative">
                <img
                  src={fileUrl}
                  alt={`image-${index}`}
                  className="h-48 lg:h-[200px] w-full rounded-lg object-scale-down border-4 border-dashed p-5"
                />
                <X className="absolute top-2 right-2 cursor-pointer" onClick={() => handleRemoveCurrent(index)} />
              </div>
            ))}
          </div>
        </div>
      }
      {newFileUrl.length !== 0 &&
        <div className="w-full border-t-4">
          <h1 className="w-full bg-gray-00 text-center text-lg font-semibold leading-loose">Images that will be <span className="text-green-600 font-extrabold">Added</span></h1>
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-4  p-4">
            {newFileUrl.map((fileUrl, index) => (
              <div key={index} className="relative">
                <img
                  src={fileUrl}
                  alt={`image-${index}`}
                  className="h-48 lg:h-[200px] w-full rounded-lg object-scale-down border-4 border-dashed p-5"
                />
                <X className="absolute top-2 right-2 cursor-pointer" onClick={() => handleRemoveNewFile(index)} />
              </div>
            ))}
          </div>
        </div>
      }
      {DeleteFileUrl.length !== 0 &&
        <div className="w-full border-t-4">
          <h1 className="w-full bg-gray-00 text-center text-lg font-semibold leading-loose">Images that will be <span className="text-red-600 font-extrabold">Deleted</span></h1>
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {DeleteFileUrl.map((fileUrl, index) => (
              <div key={index} className="relative">
                <img
                  src={fileUrl}
                  alt={`image-${index}`}
                  className="h-48 lg:h-[200px] w-full rounded-lg object-scale-down border-4 border-dashed p-5"
                />
                <RotateCcw className="absolute top-2 right-2 cursor-pointer" onClick={() => restoreDeletedImage(index)} />
              </div>
            ))}
          </div>
        </div>
      }


      {isUploading && <Progress value={uploadProgress} />}
      <Button
        onClick={handleSubmit}
        disabled={isUploading || false || (DeleteFileUrl.length === 0 && newFileUrl.length === 0)}
        className={cn("w-full rounded-b-lg rounded-t-none h-12 text-lg")}
      >
        {isUploading ? (
          <>
            <Loader2 className="animate-spin h-5 w-5 mr-3" />
            Uploading...
          </>
        ) : false ? (
          <>
            <Loader2 className="animate-spin h-5 w-5 mr-3" />
            Updating...
          </>
        ) : (
          <>Update Media</>
        )}
      </Button>
    </div>
  )
}