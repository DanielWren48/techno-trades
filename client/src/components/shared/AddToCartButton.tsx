import Cart from "../root/Cart";
import { cn } from "@/lib/utils";
import { Product } from "@/types/index";
import { useCart } from "@/hooks/useCart";
import { ShoppingCart } from "lucide-react";
import { Button, buttonVariants } from "../ui/button";

const AddToCartButton = ({ product }: { product: Product }) => {
  const { items, addItem } = useCart();
  const isInCart = items.some((item) => item.product._id === product._id);

  const handleClick = () => {
    if (!isInCart) {
      addItem(product);
    }
  };

  return (
    <div>
      {isInCart ? (
        <Cart
          showText={true}
          triggerStyles={cn(buttonVariants(), "w-full bg-dark-1 py-6 text-white text-base hover:bg-dark-4")}
        />
      ) : (
        <Button
          onClick={handleClick}
          disabled={product.stock === 0}
          size="lg"
          className={cn('w-full dark:bg-dark-2 py-6 text-white text-base hover:bg-dark-4')}
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          <ShoppingCart
            className="ml-2"
            size={24}
            color={'#FFFFFF'}
            fill={'#FFFFFF'}
          />
        </Button>
      )}
    </div>
  );
};

export default AddToCartButton;
