/**
 * @copyright (c) 2016, Philipp Thürwächter & Pattrick Hüper
 * @license BSD-3-Clause (see LICENSE in the root directory of this source tree)
 */
import { IllegalArgumentException, NullPointerException } from '@js-joda/core';

type ErrorType = new (message?: string) => Error;
interface Class<T> {
    readonly name: string;
    readonly prototype: T;
    [Symbol.hasInstance](value: unknown): boolean;
}

function className(value: unknown): string | undefined {
    if (!value) {
        return undefined;
    }

    const ctor = Reflect.get(Object(value), 'constructor');
    return typeof ctor === 'function' && ctor.name.length > 0 ? ctor.name : undefined;
}

/** @private */
export function assert(assertion: unknown, msg: string, error?: ErrorType | null): void {
    if (assertion) {
        return;
    }
    if (error) {
        throw new error(msg);
    }
    throw new Error(msg);
}

/** @private */
export function requireNonNull<T>(value: T | null | undefined, parameterName: string): T {
    if (value == null) {
        throw new NullPointerException(`${parameterName} must not be null`);
    }
    return value;
}

/** @private */
export function requireInstance<T>(value: unknown, type: Class<T>, parameterName: string): T {
    if (value instanceof type) {
        return value as T;
    }

    const actual = className(value);
    const suffix = actual === undefined ? '' : `, but is ${actual}`;
    throw new IllegalArgumentException(
        `${parameterName} must be an instance of ${type.name || type}${suffix}`,
    );
}

/** @private */
export function abstractMethodFail(methodName: string): never {
    throw new TypeError(`abstract method "${methodName}" is not implemented`);
}
