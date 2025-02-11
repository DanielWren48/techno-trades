import { useState } from 'react';
import { Shell } from "@/components/dashboard/shell";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import NewProductCreateDetails from '../components/new-product-form';
import { NewProductSchemaType } from '../schemas/product';

export default function DashboardAccount() {
  const [activeTabs, setActiveTabs] = useState<string[]>(["details"]);
  const [productData, setProductData] = useState<NewProductSchemaType | undefined>();

  return (
    <Shell variant={'default'} className='max-w-5xl'>
      <Card>
        <CardHeader className="flex gap-6 p-5">
          <CardTitle className="flex justify-center">
            Create a new product!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={["details"]} value={activeTabs} onValueChange={setActiveTabs}>
            <AccordionItem value="details" className='border-none'>
              <AccordionContent className='flex flex-col gap-6'>
                <NewProductCreateDetails
                  setProductData={setProductData}
                  setActiveTabs={setActiveTabs}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </Shell >
  );
}
