export type Check<R> = (value: any) => R;

export function guard<R>(test: (value: any) => boolean): Check<R> {
    return (value: any) => {
        if (test(value)) {
            return value;
        }
        throw new Error(`Gaurd failed for '${value}`);
    };
}

export function is<R>(test: any): Check<R> {
    return (value: any) => {
        if (Object.is(value, test)) {
            return value;
        }
        throw new Error(`Expected ${test}`);
    };
}

export function typeOf<R>(type: string): Check<R> {
    return (value: any) => {
        if (typeof value === type) {
            return value;
        }
        throw new Error(`Expected ${type}`);
    };
}

export function instanceOf<R>(ctor: new (...args: any[]) => R): Check<R> {
    return (value: any) => {
        if (value instanceof ctor) {
            return value;
        }
        throw new Error(`Expected ${ctor.name}`);
    };
}

export function union<R1, R2>(
    check1: Check<R1>,
    check2: Check<R2>,
): Check<R1 | R2> {
    return (value: any) => {
        try {
            return check1(value);
        } catch {
            return check2(value);
        }
    };
}

const _null = is<null>(null);
const _undefined = typeOf<undefined>('undefined');
const _boolean = typeOf<boolean>('boolean');
const _symbol = typeOf<symbol>('symbol');
const _number = typeOf<number>('number');
const _string = typeOf<string>('string');

export {
    _null as null,
    _undefined as undefined,
    _boolean as boolean,
    _symbol as symbol,
    _number as number,
    _string as string,
};

export const option = <R>(check: Check<R>) => union(check, _null);

export function array<R>(check: Check<R>): Check<R[]> {
    return (value: any) => {
        if (Array.isArray(value)) {
            return value.map(check);
        }
        throw new Error('Expected array');
    };
}
