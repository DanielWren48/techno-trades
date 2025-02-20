import React from 'react'
import { ProductImage } from "@/types";
import { useCallback, useState } from "react";
import { useUploadThing } from "@/uploadthing";
import { Button } from "@/components/ui/button";
import { FileWithPath } from "@uploadthing/react";
import { Loader2, X } from "lucide-react";
import { useDropzone } from "@uploadthing/react/hooks";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { convertFileToUrl } from "@/lib/utils";
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { NewProductSchemaType } from '@/_dashboard/schemas/product';

interface ProductImageUploadProps {
    productData: NewProductSchemaType
    handleTabChange: (value: string) => void
    setProductData: React.Dispatch<React.SetStateAction<NewProductSchemaType | undefined>>
}

export default function ProductImageUpload({ productData, handleTabChange, setProductData }: ProductImageUploadProps) {
    const [files, setFiles] = useState<FileWithPath[]>([]);
    const [fileUrls, setFileUrls] = useState<string[]>([]);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
        const newFiles = [...files, ...acceptedFiles];
        const newFileUrls = newFiles.map(convertFileToUrl);
        setFiles(newFiles);
        setFileUrls(newFileUrls);
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

    function handleRemoveFile(index: number) {
        const updatedFiles = [...files];
        const removedFile = updatedFiles.splice(index, 1);
        const updatedFileUrls = updatedFiles.map(convertFileToUrl);
        setFiles(updatedFiles);
        setFileUrls(updatedFileUrls);
    }

    async function handleSubmit() {
        const UploadFileResponse = await startUpload(files)
        const productImages: ProductImage[] = UploadFileResponse!.map((imageData) => ({
            key: imageData.key as string,
            name: imageData.name as string,
            url: imageData.url as string,
        }));

        setProductData({ ...productData, image: productImages });
        handleTabChange("overview");
        setFiles([]);
        setFileUrls([]);
    };

    return (
        <section>
            <div className="flex justify-center items-center flex-col border rounded-xl">
                <div
                    {...getRootProps()}
                    className="cursor-pointer max-h-[300px] w-full"
                >
                    <input {...getInputProps()} className="cursor-pointer" />
                    <div className="flex justify-center items-center flex-col p-7 h-80 lg:h-[200px]">
                        <h3 className="base-medium text-dark-4 dark:text-light-2/90 text-lg mb-2 mt-6">Drag or Drop photos here</h3>
                        <p className="text-light-4 small-regular mb-6">PNG, JPEG, JPG</p>

                        <Button
                            type="button"
                            variant={"secondary"}
                            disabled={isUploading}
                            className="h-12 border-4"
                        >
                            {files.length === 0 ? "Select from computer" : "Add More"}
                        </Button>
                    </div>
                </div>
                {fileUrls.length !== 0 &&
                    <div className="w-full p-4 grid grid-cols-3 lg:grid-cols-4 gap-4 border-t">
                        {fileUrls.map((fileUrl, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={fileUrl}
                                    alt={`image-${index}`}
                                    className="h-48 lg:h-[200px] w-full rounded-lg object-scale-down bg-white border-4 border-dashed p-5 select-none"
                                />
                                <X className="absolute top-2 right-2 cursor-pointer text-dark-4" onClick={() => handleRemoveFile(index)} />
                            </div>
                        ))}
                    </div>
                }
            </div>

            {isUploading && <Progress value={uploadProgress} />}
            <Button onClick={handleSubmit} disabled={isUploading} className='w-full my-5' variant={'default'}>
                {isUploading ? (
                    <>
                        <Loader2 className="animate-spin h-5 w-5 mr-3" />
                        Uploading...
                    </>
                ) : (
                    <>Continue</>
                )}
            </Button>
        </section>
    )
}