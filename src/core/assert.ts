/**
 * @copyright (c) 2016, Philipp Thürwächter & Pattrick Hüper
 * @license BSD-3-Clause (see LICENSE in the root directory of this source tree)
 */

import { IllegalArgumentException, NullPointerException } from './errors.ts';

type ErrorConstructor = new (message?: string) => Error;
type Constructor<T> = Function & { prototype: T; name?: string };

export function assert(
    condition: unknown,
    message: unknown = 'assertion failed',
    ErrorType: ErrorConstructor = Error,
): asserts condition {
    if (!condition) {
        throw new ErrorType(String(message));
    }
}

export function requireNonNull<T>(value: T | null | undefined, parameterName = 'value'): T {
    if (value == null) {
        throw new NullPointerException(`${parameterName} must not be null`);
    }
    return value;
}

export function requireInstance<T>(
    value: unknown,
    Type: Constructor<T>,
    parameterName = 'value',
): T {
    if (!(value instanceof Type)) {
        const expected = Type.name || String(Type);
        const actual = value != null && typeof value === 'object' && value.constructor?.name
            ? `, but is ${value.constructor.name}`
            : '';
        throw new IllegalArgumentException(`${parameterName} must be an instance of ${expected}${actual}`);
    }
    return value as T;
}

export function abstractMethodFail(methodName: string): never {
    throw new TypeError(`abstract method "${methodName}" is not implemented`);
}
