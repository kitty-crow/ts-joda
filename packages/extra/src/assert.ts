/**
 * @copyright (c) 2016, Philipp Thürwächter & Pattrick Hüper
 * @license BSD-3-Clause (see LICENSE in the root directory of this source tree)
 */
import { IllegalArgumentException, NullPointerException } from '@js-joda/core';

type ErrorType = new (message?: string) => Error;
type Class<T> = (abstract new (...args: never[]) => T) & { readonly name: string };

/**
 * @private
 */
export function assert(
    assertion: unknown,
    msg: string,
    error?: ErrorType | null,
): asserts assertion {
    if (assertion) {
        return;
    }
    if (error != null) {
        throw new error(msg);
    }
    throw new Error(msg);
}

/**
 * @private
 */
export function requireNonNull<T>(
    value: T | null | undefined,
    parameterName: string,
): T {
    if (value == null) {
        throw new NullPointerException(`${parameterName} must not be null`);
    }
    return value;
}

/**
 * @private
 */
export function requireInstance<T>(
    value: unknown,
    type: Class<T>,
    parameterName: string,
): T {
    if (value instanceof type) {
        return value;
    }

    const actual = value != null
        ? (value as { constructor?: { name?: string } }).constructor?.name
        : undefined;
    const suffix = actual ? `, but is ${actual}` : '';
    throw new IllegalArgumentException(
        `${parameterName} must be an instance of ${type.name || String(type)}${suffix}`,
    );
}

/**
 * @private
 */
export function abstractMethodFail(methodName: string): never {
    throw new TypeError(`abstract method "${methodName}" is not implemented`);
}
