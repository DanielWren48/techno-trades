import * as z from "zod";

export const accountUpdateSchema = z.object({
    firstName: z.string().min(2, { message: "Must be at least 2 characters." }),
    lastname: z.string().min(2, { message: "Must be at least 2 characters." }),
    avatar: z.string().optional(),
});
export type AccountUpdateSchemaType = z.infer<typeof accountUpdateSchema>

export const emailUpdateSchema = z.object({
    currentEmail: z.string().email(),
    newEmail: z.string().email(),
    otp: z.string().min(6, { message: "Your one-time password must be 6 characters." })
});
export type EmailUpdateSchemaType = z.infer<typeof emailUpdateSchema>

export const passwordUpdateSchema = z.object({
    passwordCurrent: z.string().min(8, { message: "Password must be at least 8 characters." }),
    password: z.string().min(8, { message: "Password must be at least 8 characters." }),
    passwordConfirm: z.string().min(8, { message: "Password must be at least 8 characters." })
}).refine((data) => {
    return data.password === data.passwordConfirm;
}, {
    message: "Password do not match",
    path: ["newPasswordConfirm"]
});
export type PasswordUpdateSchemaType = z.infer<typeof passwordUpdateSchema>

export const verifyAccountScheme = z.object({
    email: z.string().email(),
    otp: z.string().min(6, { message: "Your one-time password must be 6 characters." })
});
export type VerifyAccountSchemeType = z.infer<typeof verifyAccountScheme>