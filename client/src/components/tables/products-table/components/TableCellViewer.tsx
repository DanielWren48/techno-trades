"use client"

import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button";
import { ProductType } from "@/lib/validation";
import { ProductUpdateForm } from "../forms/update";

export function TableCellViewer({ product }: { product: ProductType; }) {

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="link" className="w-fit px-0 text-left text-foreground">
                    {product.name}
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col w-3/5 sm:max-w-2xl">
                <SheetHeader className="gap-1">
                    <SheetTitle>{product.name}</SheetTitle>
                    <SheetDescription>Update product </SheetDescription>
                </SheetHeader>
                <ProductUpdateForm product={product} />
                <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0">
                    <Button type="submit" form={'details-form'} className="w-full capitalize">Update</Button>
                    <SheetClose asChild>
                        <Button type="reset" variant="outline" className="w-full">
                            Cancel
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}