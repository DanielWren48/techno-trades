import { Expose } from "class-transformer";
import { Example } from "./utils";
import { IsEmail, IsNotEmpty, IsNumber, Length, Max, Min } from "class-validator";
import { EmailSchema } from "./base";

export class UpdateUserDetails {
    @Example('John')
    @Expose()
    @Length(3, 50)
    firstName?: string;

    @Example('Doe')
    @Expose()
    @Length(3, 50)
    lastName?: string;

    @Expose()
    @Example("https://img.com/john-doe")
    avatar?: string
}

export class UpdateUserEmail {
    @Example('johndoe@example.com')
    @Expose()
    @IsEmail({}, { message: "Enter a valid email address" })
    email?: string;

    @Example(123456)
    @Expose()
    @Min(100000)
    @Max(999999)
    @IsNumber()
    otp?: number;
}

export class UpdateUserPassword {
    @Example('strongpassword')
    @Expose()
    @Length(8, 50)
    password?: string;

    @Example('strongpassword')
    @Expose()
    @Length(8, 50)
    passwordCurrent?: string;
}