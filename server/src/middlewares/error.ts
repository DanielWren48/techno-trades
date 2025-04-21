import express, { NextFunction, Request, Response } from "express";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { registerDecorator, validate, ValidationArguments, ValidationError, ValidationOptions } from 'class-validator';
import { ErrorCode, RequestError } from "../config/handlers"
import { CustomResponse } from "../config/utils"
import { Types } from "mongoose";

export const validationMiddleware = <T extends object>(type: ClassConstructor<T>) =>
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const instance = plainToInstance(type, req.body);
        const errors: ValidationError[] = await validate(instance);
        if (errors.length > 0) {
            const formattedErrors = errors.reduce((acc, error) => {
                if (error.constraints) {
                    // Get the first constraint message
                    const [firstConstraint] = Object.values(error.constraints);
                    acc[error.property] = firstConstraint;
                }
                return acc;
            }, {} as Record<string, string>);
            const errResp = CustomResponse.error("Invalid Entry", ErrorCode.INVALID_ENTRY, formattedErrors)
            res.status(422).json(errResp)
            return
        }
        next();
    };

export function IsMongoId(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isMongoId',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return typeof value === 'string' && Types.ObjectId.isValid(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be a valid MongoDB ObjectId`;
                },
            },
        });
    };
}

export const handleError = (err: RequestError, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || 500;
    const code = err.code || ErrorCode.SERVER_ERROR;
    const message = err.message || 'Something went wrong';
    const data = err.data || null;

    // Format the error response
    const errorResponse = {
        status: 'failure',
        message: message,
        code: code,
        ...(data && { data: data }) // Conditionally include `data` if it exists
    };

    res.status(status).json(errorResponse);
};

export const asyncHandler = (fn: any) => (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    Promise.resolve(fn(req, res, next)).catch(next);
}