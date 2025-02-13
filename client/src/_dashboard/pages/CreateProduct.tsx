import { useEffect, useState } from 'react';
import { Shell } from "@/components/dashboard/shell";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import NewProductCreateDetails from '../components/new-product-form';
import { NewProductSchemaType } from '../schemas/product';
import SetProductDiscountForm from '../components/product-discount-form';
import MarkdownEditor from '../components/MarkdownEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MarkdownDisplay from '../components/MarkdownDisplay';
import { PS5_TEMPLATE } from '../components/mdx-item-example';
import ProductImageUpload from '../components/product-image-upload';
import { useLocation, useNavigate } from 'react-router-dom';

export default function DashboardAccount() {
  const [activeTab, setActiveTab] = useState<string>("details");
  const [productData, setProductData] = useState<NewProductSchemaType | undefined>();
  const [markdown, setMarkdown] = useState<string>(PS5_TEMPLATE);

  const location = useLocation();
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ["details", "discount", "description", "images", "overview"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/dashboard/new-product?tab=${value}`);
  };

  return (
    <Shell variant={'default'} className='max-w-5xl'>
      <Card>
        <CardHeader className="flex gap-6 p-5 px-9">
          <CardTitle className="flex justify-center">
            Create a new product!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" value={activeTab} onValueChange={handleTabChange}>
            <AccordionItem value="details" className='border-none'>
              <AccordionContent className='flex flex-col gap-6 px-1'>
                <NewProductCreateDetails
                  setProductData={setProductData}
                  handleTabChange={handleTabChange}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="discount" className='border-none'>
              <AccordionContent className='px-1'>
                <SetProductDiscountForm
                  productData={productData!}
                  setProductData={setProductData}
                  handleTabChange={handleTabChange}
                />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="description" className='border-none'>
              <AccordionContent className='px-1'>
                <Tabs defaultValue="editor" className="w-full">
                  <TabsList className='w-full'>
                    <TabsTrigger className='w-full' value="editor">Editor</TabsTrigger>
                    <TabsTrigger className='w-full' value="preview">Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="editor">
                    <MarkdownEditor
                      markdown={markdown}
                      setMarkdown={setMarkdown}
                      productData={productData!}
                      setProductData={setProductData}
                      handleTabChange={handleTabChange}
                    />
                  </TabsContent>
                  <TabsContent value="preview">
                    <MarkdownDisplay content={markdown} />
                  </TabsContent>
                </Tabs>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="images" className='border-none'>
              <AccordionContent className='px-1'>
                <ProductImageUpload
                  productData={productData!}
                  setProductData={setProductData}
                  handleTabChange={handleTabChange}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
        <CardFooter>
          {JSON.stringify(productData)}
        </CardFooter>
      </Card>
    </Shell >
  );
}
