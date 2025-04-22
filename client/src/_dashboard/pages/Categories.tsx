import { cn } from "@/lib/utils";
import { PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Shell } from "@/components/dashboard/shell";
import { Header } from "@/components/dashboard/header";
import { useGetCategories } from "@/api/queries/category";
import CreateCategoryDialog from "../components/category/create-category-form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Categories = () => {
    const { data, isLoading, refetch } = useGetCategories();

    const categories = data?.data

    return (
        <Shell>
            <Header title="Categories" size="default" />

            <CreateCategoryDialog
                successCallback={() => refetch()}
                trigger={
                    <Button className="gap-2 text-sm max-w-sm">
                        <PlusSquare className="h-4 w-4" />
                        Create category
                    </Button>
                } />

            <div className="grid gap-10">
                {categories && (
                    <Table>
                        <TableHeader>
                            <TableRow className={cn("bg-accent")}>
                                <TableHead className="text-center">
                                    Image
                                </TableHead>
                                <TableHead className="text-center">
                                    Name
                                </TableHead>
                                <TableHead className="text-center">
                                    Icon
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category) => (
                                <TableRow key={category._id} className={cn("")}>
                                    <TableCell className="flex justify-center items-center">
                                        <img
                                            className="w-20 h-14 object-cover"
                                            src={category.image ?? ""}
                                            alt={category.slug}
                                        />
                                    </TableCell>
                                    <TableCell className="text-lg text-center">
                                        {category.name}
                                    </TableCell>
                                    <TableCell className="text-3xl text-center">
                                        {category.icon}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </Shell>
    );
};

export default Categories;