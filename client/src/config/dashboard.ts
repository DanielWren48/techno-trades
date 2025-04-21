import { type SidebarNavItem } from "@/types";

export interface DashboardConfig {
  sidebarNav: SidebarNavItem[];
}

export const dashboardConfig: DashboardConfig = {
  sidebarNav: [
    {
      title: "Account",
      label: "",
      for: "all",
      href: "/dashboard/account/",
      icon: "user",
      variant: "ghost",
      items: [],
    },
    {
      title: "My Oders",
      label: "",
      for: "all",
      href: "/dashboard/my-orders/",
      icon: "orders",
      variant: "default",
      items: [],
    },
    {
      title: "Notifications",
      label: "",
      for: "all",
      href: "/dashboard/notifications/",
      icon: "bell",
      variant: "ghost",
      items: [],
    },
    {
      title: "Appearance",
      label: "",
      for: "all",
      href: "/dashboard/appearance/",
      icon: "theme",
      variant: "default",
      items: [],
    },
    {
      title: "Favourites",
      label: "",
      for: "all",
      href: "/dashboard/favourites/",
      icon: "heart",
      variant: "ghost",
      items: [],
    },
    {
      title: "Dashbaord",
      label: "",
      for: "admin",
      href: "/dashboard",
      icon: "dashboard",
      variant: "ghost",
      items: [],
    },
    {
      title: "Data Table",
      label: "",
      for: "admin",
      href: "/dashboard/data-tables",
      icon: "table",
      variant: "ghost",
      items: [
        {
          title: "Products",
          href: "/dashboard/data-tables?tab=products",
        },
        {
          title: "Orders",
          href: "/dashboard/data-tables?tab=orders",
        },
        {
          title: "Users",
          href: "/dashboard/data-tables?tab=users",
        },
        {
          title: "Reviews",
          href: "/dashboard/data-tables?tab=reviews",
        },
      ],
    },
    {
      title: "Create Product",
      label: "",
      for: "admin",
      href: "/dashboard/new-product?tab=details",
      icon: "add",
      variant: "default",
      items: [],
    },
    {
      title: "Categories",
      label: "",
      for: "admin",
      href: "/dashboard/categories",
      icon: "categories",
      variant: "default",
      items: [],
    },
  ],
}