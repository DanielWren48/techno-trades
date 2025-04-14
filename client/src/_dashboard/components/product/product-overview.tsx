import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tag, Box, Inbox, Package, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useUserContext } from '@/context/AuthContext';
import { useCreateNewProduct } from '@/api/queries/product';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { NewProductSchemaType } from '@/_dashboard/schemas/product';

interface ProductImageUploadProps {
  productData: NewProductSchemaType
  handleTabChange: (value: string) => void
  setProductData: React.Dispatch<React.SetStateAction<NewProductSchemaType | undefined>>
}

export default function ProductOverview({ productData, handleTabChange, setProductData }: ProductImageUploadProps) {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { mutateAsync: createProduct, isPending: isLoadingCreate } = useCreateNewProduct();
  const { name, brand, category, description, price, countInStock, discountedPrice, isDiscounted, image } = productData

  async function handleSubmit() {

    const response = await createProduct({
      ...productData,
      userId: user._id,
    });

    if (response && response.status === "success") {
      toast.success(response.message, {
        action: {
          label: 'View Product',
          onClick: () => navigate(`/products/${response.data?.slug}`)
        },
        duration: 5000,
      })

      handleTabChange("details");
      setProductData(undefined);
    } else if (response.status === "failure" && response.data) {
      toast.error(response.message)
    } else {
      toast.error('An Error occured while creating product! Please try again.')
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Image */}
        <Card>
          <CardContent className="pt-6">
            <div className="aspect-square relative overflow-hidden rounded-lg">
              <img
                src={image[0]?.url || '/api/placeholder/400/400'}
                alt={name}
                className="object-contain w-full h-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Product Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4" />
              <span className="font-medium">Brand:</span>
              <span>{brand}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Box className="h-4 w-4" />
              <span className="font-medium">Category:</span>
              <Badge variant="secondary" className="capitalize">
                {category}
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span className="font-medium">Stock:</span>
              <span>{countInStock} units</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Inbox className="h-4 w-4" />
                <span className="font-medium">Price:</span>
              </div>
              <div className="pl-6">
                {isDiscounted ? (
                  <div className="space-y-1">
                    <div className="text-xl font-bold text-green-600">
                      {formatPrice(discountedPrice || 0)}
                    </div>
                    <div className="text-sm line-through text-muted-foreground">
                      {formatPrice(price)}
                    </div>
                    <Badge variant="destructive">
                      {Math.round(((price - (discountedPrice || 0)) / price) * 100)}% OFF
                    </Badge>
                  </div>
                ) : (
                  <div className="text-xl font-bold">
                    {formatPrice(price)}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <Markdown>{description}</Markdown>
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} disabled={isLoadingCreate} className='w-full my-5' variant={'default'}>
        {isLoadingCreate ? (
          <>
            <Loader2 className="animate-spin h-5 w-5 mr-3" />
            Creating...
          </>
        ) : (
          <>Create Product</>
        )}
      </Button>
    </div>
  );
}