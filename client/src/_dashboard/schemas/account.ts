import * as z from "zod";

export const accountUpdateSchema = z.object({
    firstName: z.string().min(2, { message: "Must be at least 2 characters." }),
    lastname: z.string().min(2, { message: "Must be at least 2 characters." }),
    avatar: z.string(),
});
export type AccountUpdateSchemaType = z.infer<typeof accountUpdateSchema>

export const emailUpdateSchema = z.object({
    currentEmail: z.string().email(),
    newEmail: z.string().email(),
    otp: z.string().min(6, { message: "Your one-time password must be 6 characters." })
});
export type EmailUpdateSchemaType = z.infer<typeof emailUpdateSchema>