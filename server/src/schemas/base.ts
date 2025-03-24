import { Expose } from "class-transformer";
import { Example } from "./utils";
import { IsEmail } from "class-validator";

export class ResponseSchema {
    status: "success" | "failure" = "success";
    message?: string;
}

export class EmailSchema {
    @Expose()
    @Example("johndoe@example.com")
    @IsEmail({}, { message: "Enter a valid email address" })
    email?: string
}

export class UserSchema {
    @Expose()
    @Example("John Doe")
    name?: string

    @Expose()
    @Example("https://img.com/john-doe")
    avatar?: string
}
