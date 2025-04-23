import { useState, useEffect } from "react";
import { Shell } from "@/components/dashboard/shell";
import { useLocation, useNavigate } from "react-router-dom";
import UsersTable from "@/components/tables/users-table/data";
import OrdersTable from '@/components/tables/orders-table/data'
import ProductsTable from '@/components/tables/products-table/data'
import ReviewTable from '@/components/tables/reviews-table/data'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CategoriesTable from "@/components/tables/categories-table/data";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<string>('products');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['products', 'categories', 'orders', 'users', 'reviews'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/dashboard/data-tables?tab=${value}`);
  };

  return (
    <Shell variant={"default"}>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger className="w-full" value="products">Products</TabsTrigger>
          <TabsTrigger className="w-full" value="categories">Categories</TabsTrigger>
          <TabsTrigger className="w-full" value="orders">Orders</TabsTrigger>
          <TabsTrigger className="w-full" value="users">Users</TabsTrigger>
          <TabsTrigger className="w-full" value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <ProductsTable />
        </TabsContent>
        <TabsContent value="categories">
          <CategoriesTable />
        </TabsContent>
        <TabsContent value="orders">
          <OrdersTable />
        </TabsContent>
        <TabsContent value="users">
          <UsersTable />
        </TabsContent>
        <TabsContent value="reviews">
          <ReviewTable />
        </TabsContent>
      </Tabs>
    </Shell>
  );
}