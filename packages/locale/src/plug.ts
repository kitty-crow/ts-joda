/*
 * @copyright (c) 2017, Philipp Thuerwaechter & Pattrick Hueper
 * @license BSD-3-Clause (see LICENSE.md in the root directory of this source tree)
 */

/* eslint-disable no-param-reassign */

// @ts-expect-error Legacy JS module awaiting TypeScript migration.
import CldrDateTimeFormatterBuilder from './format/cldr/CldrDateTimeFormatterBuilder';
// @ts-expect-error Legacy JS module awaiting TypeScript migration.
import LocaleDateTimeFormatter from './format/LocaleDateTimeFormatter';

import './_init';

interface JsJodaClass {
    readonly prototype: Record<string, unknown>;
}

interface JsJodaFormatterClass extends JsJodaClass {
    RFC_1123_DATE_TIME: unknown;
}

interface JsJoda {
    readonly DateTimeFormatterBuilder: JsJodaClass;
    readonly DateTimeFormatter: JsJodaFormatterClass;
}

function copyPrototype(target: JsJodaClass, source: JsJodaClass): void {
    for (const prop of Object.getOwnPropertyNames(source.prototype)) {
        if (prop !== 'constructor') {
            target.prototype[prop] = source.prototype[prop];
        }
    }
}

/** @private */
export default function (jsJoda: JsJoda): void {
    copyPrototype(
        jsJoda.DateTimeFormatterBuilder,
        CldrDateTimeFormatterBuilder as unknown as JsJodaClass,
    );
    copyPrototype(
        jsJoda.DateTimeFormatter,
        LocaleDateTimeFormatter as unknown as JsJodaClass,
    );
    jsJoda.DateTimeFormatter.RFC_1123_DATE_TIME = (
        LocaleDateTimeFormatter as unknown as JsJodaFormatterClass
    ).RFC_1123_DATE_TIME;
}
