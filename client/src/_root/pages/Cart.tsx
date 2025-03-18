import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useEffect, useState } from "react";
import { Icons } from "@/components/shared";
import { SignInDialog } from "../components";
import { cn, formatPrice } from "@/lib/utils";
import { CartTableItem } from "@/components/root";
import { useUserContext } from "@/context/AuthContext";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function Cart() {
  const { items } = useCart();
  const { isAuthenticated, user } = useUserContext();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const cartTotal = items.reduce((total, { product, quantity }) => total + (product.isDiscounted ? product.discountedPrice! : product.price) * quantity, 0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-screen items-center">
      <div className="w-full px-2.5 md:px-10 my-20 max-w-screen-xl">

        {isAuthenticated && !user.isEmailVerified &&
          <div className="p-4 mb-4 text-blue-800 border border-blue-300 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800" role="alert">
            <div className="flex items-center">
              <Icons.info />
              <span className="sr-only">Info</span>
              <h3 className="text-lg font-medium ml-2">Your email is not verified!</h3>
            </div>
            <div className="mt-2 mb-4 text-sm">
              Please click the button bellow to verifiy your email address & come back after to finish your purchase.
            </div>
            <div className="flex">
              <Link
                className={cn(
                  buttonVariants({
                    className: "bg-blue-800",
                    size: "lg",
                  }),
                )}
                to={`/dashboard/account/${user._id}`}
              >
                Verify
              </Link>
            </div>
          </div>
        }

        <h1 className="text-xl font-bold tracking-tight text-dark-4 dark:text-white/90 sm:text-3xl text-center mb-5">
          Your Cart ({items.length}) items
        </h1>
        <div>
          <h2 className="sr-only">Items in your shopping cart</h2>
          {isMounted && items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-1 border-2 border-dashed p-4">
              <div
                aria-hidden="true"
                className="relative mb-4 h-52 w-52 text-muted-foreground"
              >
                <img
                  src="images/undraw_empty_cart_co35.png"
                  className="fill"
                  alt="image"
                />
              </div>
              <h3 className="font-semibold text-2xl">Your cart is empty</h3>
              <p className="text-muted-foreground text-center">
                Whoops! Nothing to show here yet.
              </p>
            </div>
          ) : null}
          {isMounted && items.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow className={cn("hover:bg-transparent")}>
                  <TableHead className="text-left text-base text-dark-1 dark:text-white/90 font-thin">
                    Products
                  </TableHead>
                  <TableHead className="text-left text-base text-dark-1 dark:text-white/90 font-thin">
                    Quantity
                  </TableHead>
                  <TableHead className="text-center text-base text-dark-1 dark:text-white/90 font-thin">
                    Subtotal
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <CartTableItem
                    product={item.product}
                    qty={item.quantity}
                    key={item.product._id}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {isMounted && items.length > 0 &&
          <section className="max-w-xl ml-auto mt-16 rounded-lg bg-accent dark:bg-dark-4 px-4 py-6 sm:p-6 lg:mt-0 lg:p-8">
            <h2 className="text-lg font-medium text-dark-4 dark:text-white/90">Order summary</h2>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Subtotal</p>
                <p className="text-sm font-medium text-dark-4 dark:text-white/90">
                  {isMounted ? (
                    formatPrice(cartTotal, { currency: "GBP" })
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>Shipping</span>
                </div>
                <div className="text-sm font-medium text-dark-4 dark:text-white/90">
                  <span>Calculated at Checkout</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="text-base font-medium text-muted-foreground">
                  Order Total
                </div>
                <div className="text-base font-medium text-dark-4 dark:text-white/90">
                  {isMounted ? (
                    formatPrice(cartTotal, { currency: "GBP" })
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              {isAuthenticated ? (
                <Link
                  className={cn(
                    buttonVariants({
                      className: "w-full bg-dark-1 py-7 dark:text-white/90 text-lg",
                      size: "lg",
                    }),
                  )}
                  to={user.isEmailVerified ? "/checkout" : `/dashboard/account/${user._id}`}
                >
                  <Icons.visa className="w-16 bg-light-2 rounded-md p-1.5 mr-2" />
                  Checkout
                </Link>
              ) : (
                <SignInDialog />
              )}
            </div>
          </section>
        }

        <div className="w-full min-h-[10rem] bg-zinc-100 dark:bg-dark-4 mt-20 p-10 flex items-center justify-between font-jost rounded-xl">
          <div className="flex flex-col">
            <h1 className="font-bold text-xl mb-3">Continue shopping</h1>
            <p>
              Discover more products that are perfect for gift, for your
              wardrobe, or a unique addition to your collection.
            </p>
          </div>
          <Link
            to="/explore"
            className={cn(
              buttonVariants,
              "text-lg bg-dark-1 rounded-md text-white py-4 px-8"
            )}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};