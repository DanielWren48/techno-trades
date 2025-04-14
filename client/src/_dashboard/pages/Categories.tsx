import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Shell } from "@/components/dashboard/shell";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/dashboard/header";
import { useGetProducts } from "@/api/queries/product";
import { categories } from "@/components/tables/products-table/filters";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Categories = () => {
  const { data, isLoading: allProductsLoading } = useGetProducts();

  const products = data?.data?.items

    const getProductCountByCategory = useMemo(() => {
        if (!products) {
            return {};
        }

        return products.reduce((countByCategory: { [x: string]: any; }, product: { category: string; }) => {
            const category = product.category;
            countByCategory[category] = (countByCategory[category] || 0) + 1;
            return countByCategory;
        }, {} as Record<string, number>);
    }, [products]);

    return (
        <Shell>
            <Header title="Categories" size="default" />
            <div className="grid gap-10">
                <Separator />
                {categories && (
                    <Table>
                        <TableHeader>
                            <TableRow className={cn("bg-accent")}>
                                <TableHead className="text-center text-base text-dark-1 dark:text-white/90 font-thin">
                                    Image
                                </TableHead>
                                <TableHead className="text-center text-base text-dark-1 dark:text-white/90 font-thin">
                                    Name
                                </TableHead>
                                <TableHead className="text-center text-base text-dark-1 dark:text-white/90 font-thin">
                                    Number of Products
                                </TableHead>
                                <TableHead className="text-left text-base text-dark-1 dark:text-white/90 font-thin">
                                    Icon
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category) => (
                                <TableRow key={category.value} className={cn("")}>
                                    <TableCell className="flex justify-center items-center">
                                        <img
                                            className="w-20 h-20 object-cover"
                                            src={category.image}
                                            alt={category.value}
                                        />
                                    </TableCell>
                                    <TableCell className="text-lg text-center">
                                        {category.label}
                                    </TableCell>
                                    <TableCell className="text-lg text-center">
                                        {getProductCountByCategory[category.value] || 0}
                                    </TableCell>
                                    <TableCell className="">
                                        <category.icon className="h-10 w-10 text-muted-foreground" />
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