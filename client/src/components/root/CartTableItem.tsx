import { useState } from "react";
import { Product } from "@/types";
import { Button } from "../ui/button";
import { useCart } from "@/hooks/useCart";
import { cn, formatPrice } from "@/lib/utils";
import { Minus, Plus, Trash } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";

type CartTableItemProps = {
  product: Product;
  qty: number;
};

const CartTableItem = ({ product, qty }: CartTableItemProps) => {
  let currentProductPrice = product.isDiscounted ? product.discountedPrice! : product.price
  const { removeItem, updateQuantity } = useCart();
  const [quantity, setQuantity] = useState(qty);

  const enterQty = (e: React.ChangeEvent<HTMLInputElement>) => {
    const re = /^[0-9\b]+$/;

    if (e.target.value === '' || re.test(e.target.value)) {
      const updatedQty = Number(e.target.value);
      if (updatedQty <= product.stock) {
        setQuantity(updatedQty);
        updateQuantity(product._id!, updatedQty);
      }
    }
  };

  const decrementQty = () => {
    const updatedQty = quantity > 1 ? quantity - 1 : 1;
    setQuantity(updatedQty);
    updateQuantity(product._id!, updatedQty);
  };

  const incrementQty = () => {
    if (product.stock >= quantity + 1) {
      const updatedQty = quantity + 1;
      setQuantity(updatedQty);
      updateQuantity(product._id!, updatedQty);
    }
  };

  function ProductDetails() {
    return (
      <div key={product._id} className="flex max-w-md">
        <div className="relative h-32 w-32  border p-2 rounded-md bg-white">
          <img
            src={product.image[0].url}
            alt="product image"
            className="h-full w-full rounded-md object-contain"
          />
        </div>

        <div className="ml-4 flex flex-1 flex-col sm:ml-6 justify-center gap-1">
          <h3 className="text-lg text-dark-4 dark:text-white/90 font-semibold">{product.name}</h3>
          <p className="text-base font-extralight text-dark-4 dark:text-white/90">
            {product?.isDiscounted ? (
              <>
                <span>{product && formatPrice(product.discountedPrice!, { currency: "GBP" })}</span>
                <span className="ml-3 text-base font-normal text-gray-500 line-through dark:text-gray-400">
                  {product && formatPrice(product.price, { currency: "GBP" })}
                </span>
              </>
            ) : (
              product && formatPrice(product.price, { currency: "GBP" })
            )}
          </p>
        </div>
      </div>
    );
  }

  function qtyButton() {
    return (
      <div className="grid grid-cols-3 border border-gray-300 rounded-lg items-center h-12 max-w-[8rem]">
        <div className="flex justify-center cursor-pointer">
          <Minus onClick={decrementQty} />
        </div>

        <input
          type="text"
          className="text-center h-full w-full min-w-30 border-none outline-none text-lg font-bold"
          value={quantity}
          onChange={enterQty}
        />

        <div className="flex justify-center cursor-pointer">
          <Plus onClick={incrementQty} />
        </div>
      </div>
    );
  }

  function ProductRemove() {
    return (
      <Button
        aria-label="remove product"
        onClick={() => removeItem(product._id!)}
        variant="ghost"
      >
        <Trash className="h-5 w-5 text-red-500" aria-hidden="true" />
      </Button>
    );
  }

  return (
    <>
      <TableRow key={product._id} className={cn("hover:bg-transparent select-none")}>
        <TableCell className="px-0">{ProductDetails()}</TableCell>
        <TableCell className="px-0">{qtyButton()}</TableCell>
        <TableCell className="text-center text-base px-0">
          {formatPrice(currentProductPrice * quantity, { currency: "GBP" })}
        </TableCell>
        <TableCell className="text-right px-0">{ProductRemove()}</TableCell>
      </TableRow>
    </>
  );
}

export default CartTableItem