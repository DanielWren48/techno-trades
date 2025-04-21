import { TransformFnParams } from 'class-transformer';
import 'reflect-metadata';

export function Example(value: any): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        Reflect.defineMetadata('example', value, target, propertyKey);
    };
}

export const transformToNumber = ({ value }: TransformFnParams): any => {
    if (value === "" || value === null || value === undefined) {
        return undefined; // Convert empty values to undefined
    }
    const parsed = parseFloat(value); // Attempt to parse as number
    return isNaN(parsed) ? value : parsed;
};