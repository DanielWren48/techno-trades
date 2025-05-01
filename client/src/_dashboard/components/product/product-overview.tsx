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
import useProductStore from '@/hooks/useProductStore';
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { useGetCategoryById } from '@/api/queries/category';

interface ProductOverviewProps {
  handleTabChange: (value: string) => void
}

export default function ProductOverview({ handleTabChange }: ProductOverviewProps) {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { mutateAsync: createProduct, isPending: isLoadingCreate } = useCreateNewProduct();
  const { productData, resetStore } = useProductStore();
  const { data } = useGetCategoryById(productData?.category || "")

  if (!productData) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <h2 className="text-xl font-medium mb-4">Product information is missing</h2>
        <p className="text-muted-foreground mb-4">Please complete the previous steps first.</p>
        <Button onClick={() => handleTabChange("details")}>
          Go to Details
        </Button>
      </div>
    );
  }

  const { name, model, brand, description, price, stock, discountedPrice, isDiscounted, image, specifications } = productData;

  async function handleSubmit() {
    if (!productData) {
      return navigate(-1)
    }

    const response = await createProduct({ ...productData, userId: user._id });

    if (response && response.status === "success") {
      toast.success(response.message, {
        action: {
          label: 'View Product',
          onClick: () => navigate(`/products/${response.data?.slug}`)
        },
        duration: 5000,
      });

      resetStore();
      handleTabChange("details");
    } else if (response.status === "failure" && response.data) {
      for (const key in response.data) {
        //@ts-expect-error
        toast.error("Error at: " + key, { description: response.data[key] });
      }
    } else {
      toast.error('An Error occurred while creating product! Please try again.');
    }
  }

  return (
    <section className="w-full space-y-6">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className='w-full'>
          <TabsTrigger className='w-full' value="details">Details</TabsTrigger>
          <TabsTrigger className='w-full' value="description">Description</TabsTrigger>
          <TabsTrigger className='w-full' value="specifications">Specifications</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <Carousel>
            <CarouselContent>
              {image.map(({ key, _id, url, name }) => (
                <CarouselItem key={key}>
                  <Card className="p-1">
                    <CardContent className="pt-6">
                      <div className="aspect-square relative overflow-hidden rounded-lg">
                        <img
                          src={url}
                          alt={name}
                          className="object-contain w-full h-full"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>


          {/* Product Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold line-clamp-1">{name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Model:</span>
                <span>{model}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-medium">Brand:</span>
                <span>{brand}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-medium">Category:</span>
                <Badge variant="secondary" className="capitalize">
                  {data?.data?.name}
                </Badge>
              </div>

              <div className="flex items-center space-x-2">
                <span className="font-medium">Stock:</span>
                <span>{stock} units</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Price:</span>
                </div>
                <div className="pl-6">
                  {isDiscounted ? (
                    <div className="space-y-1">
                      <div className="text-xl font-bold text-green-600">
                        {formatPrice(discountedPrice || 0, { currency: "GBP" })}
                      </div>
                      <div className="text-sm line-through text-muted-foreground">
                        {formatPrice(price, { currency: "GBP" })}
                      </div>
                      <Badge variant="destructive">
                        {Math.round(((price - (discountedPrice || 0)) / price) * 100)}% OFF
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-xl font-bold">
                      {formatPrice(price, { currency: "GBP" })}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

        </TabsContent>
        <TabsContent value="description">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <Markdown>{description}</Markdown>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="specifications">
          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {specifications?.map(({ key, value }, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{key}</TableCell>
                      <TableCell>{value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
    </section>
  );
}