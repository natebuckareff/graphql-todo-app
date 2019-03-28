import { Maybe } from './util';

export function isType<T>(type: string, value: any): T {
    if (typeof value === type) {
        return value;
    }
    throw new Error(`Expected ${type}`);
}

export const isBoolean = (x: any) => isType<boolean>('boolean', x);
export const isString = (x: any) => isType<string>('string', x);
export const isNumber = (x: any) => isType<number>('number', x);

export function isID(value: any): string {
    if (typeof value === 'string' || typeof value === 'number') {
        return value + '';
    }
    throw new Error('Expected string or number');
}

export function isInstance<T>(ctor: new () => T, value?: any): T {
    if (value instanceof ctor) {
        return value;
    }
    throw new Error(`Expected instance of '${ctor.name}`);
}

export function isArray<T>(predicate: (value: any) => T, values: any[]): T[] {
    return values.map(x => predicate(x));
}

export function isMaybe<T>(predicate: (value: any) => T, value: any): Maybe<T> {
    if (Object.is(value, null) || Object.is(value, undefined)) {
        return null;
    } else {
        return predicate(value);
    }
}
