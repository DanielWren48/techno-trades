import { useEffect } from 'react';
import { Shell } from "@/components/dashboard/shell";
import useProductStore from '@/hooks/useProductStore';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion"
import { MarkdownDisplay, MarkdownEditor, NewProductForm, ProductCreateSteps, ProductDiscountForm, ProductImageUpload, ProductOverview } from '../components';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { mediaApiEndpoints } from '@/api/client';

export default function DashboardAccount() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeTab, setActiveTab, productData, markdown, canProceedToStep, completedSteps } = useProductStore();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');

    if (tabParam && ["details", "discount", "description", "images", "overview"].includes(tabParam)) {
      if (tabParam === 'details' || canProceedToStep(tabParam)) {
        setActiveTab(tabParam);
      } else {
        navigate(`/dashboard/new-product?tab=${activeTab}`);
      }
    }
  }, [location.search, setActiveTab, canProceedToStep, navigate, activeTab]);

  const handleTabChange = (value: string) => {
    if (value === 'details' || canProceedToStep(value)) {
      setActiveTab(value);
      navigate(`/dashboard/new-product?tab=${value}`);
    } else {
      toast.error(`Please complete the ${activeTab}`);
    }
  };

  const clearFormProgress = async () => {
    if (window.confirm("Are you sure you want to clear all progress?")) {
      if (productData && productData.image.length > 0) {
        const fileKeys = productData.image.flatMap(i => i.key)

        toast.promise(mediaApiEndpoints.deleteFiles(fileKeys),
          {
            id: "delete-file",
            loading: 'Removing file...',
            success: ({ message, status, code }) => {
              if (status === "success" && code === "201") {
                return toast.info('message')
              } else if (status === "failure" && code === "400") {
                return toast.error('Error deleting file')
              } else {
                return toast.error(message)
              }
            },
            error: () => 'Error deleting files.',
          }
        );
      }
      useProductStore.getState().resetStore();
      toast.info("Progress renewd")
      navigate("/dashboard/new-product?tab=details");
    }
  }

  return (
    <Shell variant={'default'} className='max-w-5xl'>
      <Card>
        <CardHeader className="flex gap-6 p-5 px-9">
          <CardTitle className="flex justify-center">
            Create a new product!
          </CardTitle>
          <CardHeader><ProductCreateSteps /></CardHeader>
        </CardHeader>
        <CardContent>
          <Accordion type="single" value={activeTab} onValueChange={handleTabChange}>
            <AccordionItem value="details" className='border-none'>
              <AccordionContent className='flex flex-col gap-6 px-1'>
                <NewProductForm handleTabChange={handleTabChange} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="discount" className='border-none'>
              <AccordionContent className='px-1'>
                {canProceedToStep('discount') ? (
                  <ProductDiscountForm handleTabChange={handleTabChange} />
                ) : (
                  <div className="p-4 text-center">
                    <p>Please complete the product details first</p>
                    <Button
                      onClick={() => handleTabChange('details')}
                      variant="outline"
                      className="mt-2"
                    >
                      Go to Details
                    </Button>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="description" className='border-none'>
              <AccordionContent className='px-1'>
                {canProceedToStep('description') ? (
                  <Tabs defaultValue="editor" className="w-full">
                    <TabsList className='w-full'>
                      <TabsTrigger className='w-full' value="editor">Editor</TabsTrigger>
                      <TabsTrigger className='w-full' value="preview">Preview</TabsTrigger>
                    </TabsList>
                    <TabsContent value="editor">
                      <MarkdownEditor handleTabChange={handleTabChange} />
                    </TabsContent>
                    <TabsContent value="preview">
                      <MarkdownDisplay content={markdown} />
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="p-4 text-center">
                    <p>Please complete the previous steps first</p>
                    <Button
                      onClick={() => handleTabChange('discount')}
                      variant="outline"
                      className="mt-2"
                    >
                      Go to Discount
                    </Button>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="images" className='border-none'>
              <AccordionContent className='px-1'>
                {canProceedToStep('images') ? (
                  <ProductImageUpload handleTabChange={handleTabChange} />
                ) : (
                  <div className="p-4 text-center">
                    <p>Please complete the product details first</p>
                    <Button
                      onClick={() => handleTabChange('details')}
                      variant="outline"
                      className="mt-2"
                    >
                      Go to Details
                    </Button>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="overview" className='border-none'>
              <AccordionContent className='px-1'>
                {canProceedToStep('overview') ? (
                  <ProductOverview handleTabChange={handleTabChange} />
                ) : (
                  <div className="p-4 text-center">
                    <p>Please complete the product details first</p>
                    <Button
                      onClick={() => handleTabChange('details')}
                      variant="outline"
                      className="mt-2"
                    >
                      Go to Details
                    </Button>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => clearFormProgress()} >
            Clear Progress
          </Button>

          <div className="text-xs text-gray-500">
            {productData ? "Progress saved" : "No saved progress"}
          </div>
        </CardFooter>
      </Card>
    </Shell>
  );
}