import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useUserContext } from "@/context/AuthContext"
import { Fragment } from "react"
import { Checkbox } from "@/components/ui/checkbox"

const counties = [
    {
        value: 'GB',
        label: 'United Kingdom',
    }
];

const shippingAddressFormSchema = z.object({
    line1: z.string().min(1, 'Address is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().optional(),
    postal_code: z.string().min(5, 'Postcode must be at least 5 characters'),
    country: z.enum(counties.map((county) => county.value) as [string, ...string[]], {
        required_error: "Country is required",
    }),
    save_address: z.boolean().optional(),
})

export type ShippingAddressFormSchema = z.infer<typeof shippingAddressFormSchema>

interface ShippingFormProps {
    setShippingAddress: React.Dispatch<React.SetStateAction<ShippingAddressFormSchema | undefined>>
}

export default function AddressForm({ setShippingAddress }: ShippingFormProps) {
    const { user } = useUserContext();
    const form = useForm<ShippingAddressFormSchema>({
        resolver: zodResolver(shippingAddressFormSchema),
        // defaultValues: {
        //     line1: '8 Barnton Rd',
        //     line2: '',
        //     city: 'Dumfries',
        //     country: 'GB',
        //     postal_code: 'DG1 4HL',
        // }
    })

    const setAddress = (address: string) => {
        const selectedAddress = JSON.parse(address) as ShippingAddressFormSchema
        setShippingAddress(selectedAddress)
    }

    function onSubmit(data: ShippingAddressFormSchema) {
        console.log(data)
        toast.info("Address Submited")
        setShippingAddress(data)
    }

    return (
        <Card className="w-full max-w-[650px] shadow-md">
            <CardHeader>
                <CardTitle className="text-xl font-semibold">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
                <Select onValueChange={setAddress}>
                    <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select your address" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {user.shippingAddress?.map((address, index) => (
                                <SelectItem key={index} value={JSON.stringify(address)}>
                                    <span className="flex items-center">
                                        {[address.line1, address.line2, address.city, address.postal_code, address.country].filter(Boolean).join(", ")}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <Fragment>
                    <div className="flex items-center justify-between my-2">
                        <span className="w-[45%] border-b dark:border-gray-600"></span>
                        <div className="text-sm text-center text-gray-500 dark:text-gray-400">or</div>
                        <span className="w-[45%] border-b dark:border-gray-400"></span>
                    </div>
                </Fragment>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-3">
                        <FormField
                            control={form.control}
                            name="line1"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input type="text" className="h-12" placeholder="Address Line 1"{...field} />
                                    </FormControl>
                                    <FormMessage className="shad-form_message" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="line2"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input type="text" className="h-12" placeholder="Address Line 2 (Optional)"{...field} />
                                    </FormControl>
                                    <FormMessage className="shad-form_message" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input type="text" className="h-12" placeholder="City"{...field} />
                                    </FormControl>
                                    <FormMessage className="shad-form_message" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="country"
                            render={({ field }) => (
                                <FormItem>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="h-12">
                                                <SelectValue placeholder="Select a country" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectGroup>
                                                {counties.map((status, index) => (
                                                    <SelectItem key={index} value={status.value}>
                                                        <span className="flex items-center">
                                                            {status.label}
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:gap-4">
                            <FormField
                                control={form.control}
                                name="state"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input type="text" className="h-12" placeholder="State"{...field} />
                                        </FormControl>
                                        <FormMessage className="shad-form_message" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="postal_code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input type="text" className="h-12" placeholder="Postal Code"{...field} />
                                        </FormControl>
                                        <FormMessage className="shad-form_message" />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="save_address"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2 pl-1">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="font-medium">
                                            Save my address for future purchases.
                                        </FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <div className="flex gap-4 items-center justify-end">
                            <Button type="submit" disabled={false}>
                                Save
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}