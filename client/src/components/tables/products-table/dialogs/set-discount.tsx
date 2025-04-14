import { ProductType } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { calculateDiscountPercentage, cn, formatPrice } from "@/lib/utils";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { useSetProductDiscount } from "@/api/queries/product";
import { toast } from "sonner";

type EditProps = {
  product: ProductType;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function SetDiscount({ product, setOpen }: EditProps) {
  const currProductDiscount = product.isDiscounted ? calculateDiscountPercentage({ normalPrice: product.price, discountedPrice: product.discountedPrice }) : undefined
  const [discount, setDiscount] = useState<number | undefined>(currProductDiscount);
  const { mutateAsync: setProductDiscount } = useSetProductDiscount()

  const StatBox = ({ label, value }: { label: string; value: string }) => (
    <Button
      type="button"
      onClick={() => setDiscount(Number(value))}
      className={cn(
        `border h-16 hover:bg-neutral-200 border-gray-200 p-4 rounded-lg min-w-[100px] w-full text-center text-dark-4 dark:text-light-2/90
        ${discount === +value ? 'bg-gray-300 dark:bg-light-3/80' : 'bg-white dark:bg-dark-3'}`
      )}
    >
      <div className="flex gap-1">
        <h4 className="font-extrabold text-2xl">{value}</h4>
        <p>{label}</p>
      </div>
    </Button>
  );

  async function handleRemoveDiscount() {
    if (!discount) return;
    const { status, message } = await setProductDiscount({
      id: product._id!,
      isDiscounted: false,
      discountedPrice: undefined,
    })
    status === "success" ? toast.info(message) : toast.error(message)
    setOpen(false)
  }

  async function handleSubmit() {
    const discountedPrice = discount && product.price - (product.price * discount) / 100;
    const { status, message } = await setProductDiscount({
      id: product._id!,
      isDiscounted: discount !== undefined,
      discountedPrice: discountedPrice,
    })
    status === "success" ? toast.info(message) : toast.error(message)
    setOpen(false)
  }

  return (
    <div className="flex flex-col w-full max-w-[700px] mx-auto gap-5 my-5">

      {currProductDiscount && <div className="flex items-center p-4 mb-4 text-sm text-blue-800 border border-blue-300 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800" role="alert">
        <span className="sr-only">Info</span>
        <div className="flex flex-row w-full text-base items-center justify-between">
          <div className="flex">
            <AlertCircle className="w-6 h-6 mr-2" />
            <span className="font-medium">Info alert!</span> This product is currenly on <span className="font-bold">{currProductDiscount}%</span> discount!
          </div>
          <Button onClick={handleRemoveDiscount}>Remove Discount</Button>
        </div>
      </div>
      }

      <h1 className="body-bold">Set {product.name} for discount!</h1>
      <h1>Choose one of:</h1>
      <div>
        <ul className="grid grid-cols-4 gap-5">
          <StatBox label="%" value="10" />
          <StatBox label="%" value="20" />
          <StatBox label="%" value="30" />
          <StatBox label="%" value="50" />
        </ul>
      </div>
      <br />
      <Label htmlFor="inputs">Or enter manually:</Label>
      <Input
        id="input"
        placeholder="Discount %"
        type="number"
        value={discount}
        onChange={(e) => setDiscount(Number(e.target.value.slice(0, 2)))}
      />

      <div className="flex flex-row justify-around items-start gap-3 text-lg p-4 text-gray-800 border border-gray-300 rounded-lg bg-gray-50 dark:bg-dark-3/50 dark:text-gray-300 dark:border-gray-600" role="alert">
        <span className="sr-only">Info</span>
        <h1>Old Price: {formatPrice(product.price, { currency: "GBP" })}</h1>
        {!!discount && <h1>Discount of: <span className="text-red-600 font-semibold">{formatPrice(product.price * discount / 100, { currency: "GBP" })}</span></h1>}
        {!!discount && <h1>New Price:  <span className="text-blue-500 font-semibold">{formatPrice(product.price - product.price * discount / 100, { currency: "GBP" })}</span></h1>}
      </div>

      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
}
