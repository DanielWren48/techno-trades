import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Laptop,
  LayoutDashboard,
  LogOut,
  Moon,
  Palette,
  Settings,
  SunMedium,
} from "lucide-react";
import { Icons } from "../shared";
import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import { first } from "lodash";

export function UserNav() {
  const { user, isStaff, logout } = useUserContext();
  const { setTheme } = useTheme();
  const navigate = useNavigate();

  const handleSignOut = async (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    logout();
    navigate("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={user.avatar ?? undefined}
              alt={user.email}
              className="object-cover"
            />
            <AvatarFallback>{first(user.firstName)}{first(user.lastName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-xs leading-none text-muted-foreground">
              Signed in as
            </p>
            <p className="text-sm font-medium leading-none">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={`/dashboard/account/${user._id}`}>
              <Icons.user className="mr-2 h-4 w-4" />
              My Account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={`/dashboard/my-orders/${user._id}`}>
              <Icons.orders className="mr-2 h-4 w-4" />
              My Orders
            </Link>
          </DropdownMenuItem>
          {isStaff && <DropdownMenuItem asChild>
            <Link to="/dashboard/data-tables">
              <Settings className="mr-2 h-4 w-4" />
              Manage Products
            </Link>
          </DropdownMenuItem>}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="mr-2 h-4 w-4" />
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <SunMedium className="mr-2 h-4 w-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Laptop className="mr-2 h-4 w-4" />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={(e) => handleSignOut(e)}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}