/*
 * @copyright (c) 2017, Philipp Thuerwaechter & Pattrick Hueper
 * @license BSD-3-Clause (see LICENSE.md in the root directory of this source tree)
 */

import CldrDateTimeFormatterBuilder from './format/cldr/CldrDateTimeFormatterBuilder.ts';
import LocaleDateTimeFormatter from './format/LocaleDateTimeFormatter.ts';

import './_init.ts';

interface JsJodaClass {
    readonly prototype: object;
}

interface JsJodaFormatterClass extends JsJodaClass {
    RFC_1123_DATE_TIME: unknown;
}

interface JsJoda {
    readonly DateTimeFormatterBuilder: JsJodaClass;
    readonly DateTimeFormatter: JsJodaFormatterClass;
}

function classValue(value: unknown): value is JsJodaClass {
    return typeof value === 'function' && typeof value.prototype === 'object';
}

function formatterClass(value: unknown): value is JsJodaFormatterClass {
    return classValue(value);
}

function api(value: object): JsJoda {
    const builder = Reflect.get(value, 'DateTimeFormatterBuilder');
    const formatter = Reflect.get(value, 'DateTimeFormatter');
    if (!classValue(builder) || !formatterClass(formatter)) {
        throw new TypeError('Invalid js-joda plug-in API');
    }
    return {
        DateTimeFormatterBuilder: builder,
        DateTimeFormatter: formatter,
    };
}

function copyPrototype(target: JsJodaClass, source: JsJodaClass): void {
    for (const prop of Object.getOwnPropertyNames(source.prototype)) {
        if (prop === 'constructor') {
            continue;
        }
        const descriptor = Object.getOwnPropertyDescriptor(source.prototype, prop);
        if (descriptor !== undefined) {
            Object.defineProperty(target.prototype, prop, descriptor);
        }
    }
}

/** Extend a js-joda API instance with locale-aware formatters. */
export default function plug<T extends object>(value: T): void {
    const jsJoda = api(value);
    copyPrototype(jsJoda.DateTimeFormatterBuilder, CldrDateTimeFormatterBuilder);
    copyPrototype(jsJoda.DateTimeFormatter, LocaleDateTimeFormatter);
    jsJoda.DateTimeFormatter.RFC_1123_DATE_TIME = LocaleDateTimeFormatter.RFC_1123_DATE_TIME;
}
