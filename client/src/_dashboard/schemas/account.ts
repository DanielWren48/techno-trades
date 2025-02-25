import * as z from "zod";

export const accountUpdateSchema = z.object({
    firstName: z.string().min(2, { message: "Must be at least 2 characters." }),
    lastname: z.string().min(2, { message: "Must be at least 2 characters." }),
    avatar: z.string(),
});
export type AccountUpdateSchemaType = z.infer<typeof accountUpdateSchema>