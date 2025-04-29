import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import React, { useCallback, useEffect } from "react";
import CreateCategoryDialog from "./create-category-form";
import { useGetCategories, useGetCategoryById } from "@/api/queries/category";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ICategory } from "@/types";
import { Icons } from "@/components/shared";
import { isEmpty } from "lodash";
import SkeletonWrapper from "@/components/root/SkeletonWrapper";
import CreateSubCategoryDialog from "./create-sub-category-form";

interface Props {
    categoryId: ICategory["_id"]
    onChange: (value: string) => void;
}

export default function SubCategoryPicker({ categoryId, onChange }: Props) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState<string | undefined>();

    const { data, isLoading, refetch } = useGetCategoryById(categoryId)
    const categories = data?.data?.subcategories || undefined

    useEffect(() => {
        if (!value) return;
        onChange(value);
    }, [onChange, value]);

    const selectedSubCategory = categories?.find(
        (category: ICategory) => category._id === value
    );

    const successCallback = useCallback(async (category: ICategory) => {
        await refetch()
        setValue(category._id);
        setOpen((prev) => !prev);
    }, [setValue, setOpen]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <SkeletonWrapper isLoading={isLoading}>
                <PopoverTrigger disabled={!categoryId} asChild>
                    <Button
                        variant={"outline"}
                        role="combobox"
                        aria-expanded={open}
                        className="w-full h-12 justify-between"
                    >
                        {selectedSubCategory ? <CategoryRow category={selectedSubCategory} /> : !categories ? "No subcategories found" : "Select subcategory"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
            </SkeletonWrapper>
            <PopoverContent className="w-full p-0" style={{ pointerEvents: "auto" }}>
                <Command onSubmit={(e) => { e.preventDefault() }}  >
                    <CommandInput placeholder="Search category..." />
                    <CreateSubCategoryDialog parentCategoryId={categoryId} successCallback={successCallback} />
                    <CommandEmpty>
                        <p>Category not found</p>
                        <p className="text-xs text-muted-foreground">
                            Tip: Create a new category
                        </p>
                    </CommandEmpty>
                    <CommandGroup>
                        <CommandList>
                            {categories &&
                                categories.map((category: ICategory) => (
                                    <CommandItem
                                        key={category.name}
                                        onSelect={() => {
                                            setValue(category._id!);
                                            setOpen((prev) => !prev);
                                        }}
                                    >
                                        <CategoryRow category={category} />
                                        <Check
                                            className={cn(
                                                "mr-2 w-4 h-4 opacity-0",
                                                value === category.name && "opacity-100"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            {selectedSubCategory &&
                                <CommandItem
                                    className="bg-red-400/40"
                                    onSelect={() => {
                                        setValue(undefined);
                                        setOpen((prev) => !prev);
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <span role="img" className="w-7 text-lg text-center"><Icons.X /></span>
                                        <span className="capitalize text-md">Deselect Item</span>
                                    </div>
                                </CommandItem>
                            }
                        </CommandList>
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover >
    );
}

function CategoryRow({ category }: { category: ICategory }) {
    return (
        <div className="flex items-center gap-2">
            <span role="img" className="w-7 text-lg text-center">{category.icon}</span>
            <span className="capitalize text-md">{category.name}</span>
        </div>
    );
}