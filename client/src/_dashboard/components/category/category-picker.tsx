import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ICategory } from "@/api/types/category";
import { Check, ChevronsUpDown } from "lucide-react";
import React, { useCallback, useEffect } from "react";
import CreateCategoryDialog from "./create-category-form";
import { useGetCategories } from "@/api/queries/category";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface Props {
    onChange: (value: string) => void;
    defValue?: string;
}

export default function CategoryPicker({ onChange, defValue = "" }: Props) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState(defValue);

    useEffect(() => {
        if (!value) return;
        // when the value changes, call onChange callback
        onChange(value);
    }, [onChange, value]);

    const { data } = useGetCategories()

    const selectedCategory = data?.data?.find(
        (category: ICategory) => category._id === value
    );

    const successCallback = useCallback((category: ICategory) => {
        setValue(category._id!);
        setOpen((prev) => !prev);
    }, [setValue, setOpen]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    role="combobox"
                    aria-expanded={open}
                    className="w-full h-12 justify-between"
                >
                    {selectedCategory ? (
                        <CategoryRow category={selectedCategory} />
                    ) : (
                        "Select category"
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" style={{ pointerEvents: "auto" }}>
                <Command onSubmit={(e) => { e.preventDefault() }}  >
                    <CommandInput placeholder="Search category..." />
                    <CreateCategoryDialog successCallback={successCallback} />
                    <CommandEmpty>
                        <p>Category not found</p>
                        <p className="text-xs text-muted-foreground">
                            Tip: Create a new category
                        </p>
                    </CommandEmpty>
                    <CommandGroup>
                        <CommandList>
                            {data &&
                                data.data?.map((category: ICategory) => (
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
                        </CommandList>
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
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