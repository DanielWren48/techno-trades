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
import React from "react";
import { Button } from "@/components/ui/button";
import { ProductType } from "@/lib/validation";
import { ProductUpdateForm } from "../forms/update";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductDiscountForm from "../forms/discount";
import ProductImageUploadForm from "../forms/image-upload";

type ProductTabType = 'details' | 'image' | 'discount';

type TableCellViewerProps = {
    product: ProductType;
    trigger?: React.ReactNode;
    initialTab?: ProductTabType;
};

const formMappings = {
    'details': 'details-form',
    'image': 'image-form',
    'discount': 'discount-form'
};

export function TableCellViewer({ product, trigger, initialTab = 'details' }: TableCellViewerProps) {
    const [activeTab, setActiveTab] = React.useState<ProductTabType>(initialTab);
    const [activeForm, setActiveForm] = React.useState<string>(formMappings[initialTab]);

    const handleTabChange = (value: string) => {
        setActiveTab(value as ProductTabType);
        setActiveForm(formMappings[value as ProductTabType]);
    };

    const submitActiveForm = () => {
        const formElement = document.getElementById(activeForm) as HTMLFormElement;
        if (formElement) {
            formElement.requestSubmit();
        }
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                {trigger ||
                    <Button variant="link" className="w-fit px-0 text-left text-foreground">
                        {product.name}
                    </Button>
                }
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col w-3/5 sm:max-w-2xl">
                <SheetHeader className="gap-1">
                    <SheetTitle>{product.name}</SheetTitle>
                    <SheetDescription>Update product <span className="italic font-medium">{activeTab}</span></SheetDescription>
                </SheetHeader>

                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="w-full">
                        <TabsTrigger className="w-full" value="details">Details</TabsTrigger>
                        <TabsTrigger className="w-full" value="image">Images</TabsTrigger>
                        <TabsTrigger className="w-full" value="discount">Discount</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details">
                        <ProductUpdateForm product={product} />
                    </TabsContent>
                    <TabsContent value="image">
                        <ProductImageUploadForm product={product} />
                    </TabsContent>
                    <TabsContent value="discount">
                        <ProductDiscountForm product={product} />
                    </TabsContent>
                </Tabs>
                <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0">
                    <Button
                        type="button"
                        onClick={submitActiveForm}
                        className="w-full capitalize"
                    >
                        Update {activeForm.split("-")[0]}
                    </Button>
                    <SheetClose asChild>
                        <Button type="reset" variant="outline" className="w-full">
                            Cancel
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}