import { IUser } from "@/types";

export interface IUserResponse {
    users: IUser[];
}

export interface UpdateUserProfile {
    firstName: string | undefined;
    lastName: string | undefined;
    avatar?: string | null;
}

export interface UpdateUserEmail {
    email: string;
    otp: number;
}

export interface UpdateUserPassword {
    passwordCurrent: string;
    password: string;
    passwordConfirm: string;
}