import { useState } from "react";
import { Order } from "@/types/order";
import { Link, useNavigate } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { OrderInvoice } from "@/components/shared";
import { Shell } from "@/components/dashboard/shell";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/dashboard/header";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import PDFExportComponent from "@/components/shared/ExportToPDF";
import { CardSkeleton } from "@/components/dashboard/card-skeleton";
import { useGetMyOrders } from "@/api/orders/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardOrders() {
  const { data, isLoading: loadingOrders, isError: errorLoaidngOrders } = useGetMyOrders();
  const orders = data?.data?.orders

  const [orderDetails, setOrderDetails] = useState<Order>();
  const [open, setOpen] = useState<boolean>(false);
  const navigate = useNavigate()

  function handleViewDetails() {
    if (loadingOrders) {
      return (
        <>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </>
      )
    }
    if (errorLoaidngOrders) {
      return (
        <div className="text-center text-red-500 font-medium py-8">
          An error occurred while fetching your orders
          <div className="flex flex-col items-center justify-start px-4 py-8 sm:px-6 md:py-12 lg:px-8 xl:pt-16">
            <div className="text-red-500 font-medium text-xl">
              An error occurred
            </div>
            <p className="mt-3 max-w-screen-md text-center text-gray-500 dark:text-gray-300">
              Please try again later.
            </p>
          </div>
        </div>
      )
    }
    if (!loadingOrders && orders?.length === 0) {
      return (
        <div className="flex flex-col items-center w-full justify-center h-full gap-3">
          <img src="/images/2762885.png" className="w-[30rem] object-contain" />
          <h1 className="text-4xl text-muted-foreground font-medium">It appears you haven't ordered anything yet!</h1>
          <Link
            to="/explore"
            className={buttonVariants({
              variant: "link",
              className: "text-xl underline",
            })}
          >
            Let's fix that
          </Link>
        </div>
      )
    }

    if (!loadingOrders && orders?.length !== 0) {
      return (
        <div className="">
          {orders?.map((order) => (
            <Card key={order._id} className="mb-5">
              <CardHeader className="w-full rounded-t-lg bg-black/5 dark:bg-light-3/20">
                <CardTitle>
                  <div className="flex flex-row justify-between text-base font-normal text-dark-4 dark:text-muted-foreground">
                    <div className="flex flex-row gap-14">
                      <div className="flex flex-col">
                        <p>ORDER PLACED</p>
                        <p>{formatDate(order.createdAt.toString(), "short")}</p>
                      </div>
                      <div className="">
                        <p>TOTAL</p>
                        <p>{formatPrice(order.total / 100, { currency: "GBP" })}</p>
                      </div>
                      <div className="">
                        <p>DISPATCH TO</p>
                        <p>{order.paymentIntentDetails.billing_details.name}</p>
                      </div>
                    </div>
                    <div className="flex flex-row">
                      <div className="flex flex-col gap-1">
                        <p>ORDER # {order.orderNumber}</p>
                        <div className="flex flex-row gap-5 justify-end items-center">
                          <Button onClick={() => { setOpen(true); setOrderDetails(order) }} className={cn("text-blue-800/80 dark:text-blue-500 text-left p-0 m-0 w-fit h-5")} variant={"link"}>View order details </Button>
                          <PDFExportComponent invoiceComponent={<OrderInvoice order={order} />} orderName={order.orderNumber} />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="">
                <div className="">
                  <h3 className="sr-only">Items</h3>
                  {order.products.map(({ _id, product, quantity }) => {
                    return (
                      <div key={_id} className="py-10 flex space-x-6">
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-8 w-full">
                          <div className="flex gap-4 lg:col-span-2">
                            <img
                              className="flex-none w-20 h-20 object-center object-scale-down p-2 bg-white border-2 rounded-lg sm:w-36 sm:h-36"
                              src={product.image[0].url || ""}
                              alt={product.name}
                            />
                            <div className="flex-auto flex flex-col">
                              <h4 className="font-medium text-muted-foreground">{product.name}</h4>
                              <div className="mt-6 flex-1 flex items-end">
                                <dl className="flex text-sm divide-x divide-gray-200 space-x-4 sm:space-x-6">
                                  <div className="flex">
                                    <dt className="font-medium text-muted-foreground">Quantity</dt>
                                    <dd className="ml-2 text-gray-700 dark:text-light-2/90">{quantity}</dd>
                                  </div>
                                  <div className="pl-4 flex sm:pl-6">
                                    <dt className="font-medium text-muted-foreground">Price</dt>
                                    <dd className="ml-2 text-gray-700 dark:text-light-2/90">
                                      {formatPrice(product.price, { currency: "GBP" })}
                                    </dd>
                                  </div>
                                </dl>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 w-full">
                            <Button
                              variant="secondary"
                              onClick={() => navigate(`/products/${product.slug}`)}
                              className="w-full"
                            >
                              Leave Review
                            </Button>
                            <Button variant={"secondary"} onClick={() => { console.log() }} className="w-full">Request Refound</Button>
                            <Button variant={"secondary"} onClick={() => { console.log() }} className="w-full">Contact Support</Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-screen-lg min-h-fit">
              {orderDetails && <OrderInvoice order={orderDetails} className="m-[5rem]" />}
            </DialogContent>
          </Dialog>
        </div>
      )
    }
  }

  return (
    <Shell>
      <Header
        title="Orders"
        description="View all of your purchases, invloices and order details"
        size="default"
      />
      <div className="grid gap-10">
        <Separator />
        {handleViewDetails()}
      </div>
    </Shell>
  );
}