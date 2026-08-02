/*
 * @copyright (c) 2017, Philipp Thuerwaechter & Pattrick Hueper
 * @license BSD-3-Clause (see LICENSE.md in the root directory of this source tree)
 */
import { _ as jodaInternal, DateTimeException, DateTimeFormatterBuilder, SignStyle } from '@js-joda/core';
import type { ParseContext, PrinterParser, PrintContext, TextBuffer } from '../../core-types.ts';
import { WeekFields } from "../../temporal/WeekFields.ts";
const { StringBuilder } = jodaInternal;
export default class WeekFieldsPrinterParser {
    private readonly _letter: string;
    private readonly _count: number;
    constructor(letter: string, count: number) {
        this._letter = letter;
        this._count = count;
    }
    print(context: PrintContext, buf: TextBuffer): boolean {
        const weekFields = WeekFields.of(context.locale() as import('../../Locale.ts').default);
        const pp = this._evaluate(weekFields);
        return pp.print(context, buf);
    }
    parse(context: ParseContext, text: string, position: number): number {
        const weekFields = WeekFields.of(context.locale() as import('../../Locale.ts').default);
        const pp = this._evaluate(weekFields);
        return pp.parse(context, text, position);
    }
    private _evaluate(weekFields: WeekFields): PrinterParser {
        let pp: PrinterParser | null = null;
        switch (this._letter) {
            case 'e': // day-of-week
                pp = new DateTimeFormatterBuilder.NumberPrinterParser(weekFields.dayOfWeek(), this._count, 2, SignStyle.NOT_NEGATIVE);
                break;
            case 'c': // day-of-week
                pp = new DateTimeFormatterBuilder.NumberPrinterParser(weekFields.dayOfWeek(), this._count, 2, SignStyle.NOT_NEGATIVE);
                break;
            case 'w': // week-of-year
                pp = new DateTimeFormatterBuilder.NumberPrinterParser(weekFields.weekOfWeekBasedYear(), this._count, 2, SignStyle.NOT_NEGATIVE);
                break;
            case 'W': // week-of-month
                pp = new DateTimeFormatterBuilder.NumberPrinterParser(weekFields.weekOfMonth(), 1, 2, SignStyle.NOT_NEGATIVE);
                break;
            case 'Y': // weekyear
                if (this._count === 2) {
                    pp = new DateTimeFormatterBuilder.ReducedPrinterParser(weekFields.weekBasedYear(), 2, 2, 0, DateTimeFormatterBuilder.ReducedPrinterParser.BASE_DATE);
                }
                else {
                    pp = new DateTimeFormatterBuilder.NumberPrinterParser(weekFields.weekBasedYear(), this._count, 19, (this._count < 4) ? SignStyle.NORMAL : SignStyle.EXCEEDS_PAD, -1);
                }
                break;
        }
        if (pp === null) {
            throw new DateTimeException(`Unsupported week field: ${this._letter}`);
        }
        return pp;
    }
    toString(): string {
        const sb = new StringBuilder();
        sb.append('Localized(');
        if (this._letter === 'Y') {
            if (this._count === 1) {
                sb.append('WeekBasedYear');
            }
            else if (this._count === 2) {
                sb.append('ReducedValue(WeekBasedYear,2,2,2000-01-01)');
            }
            else {
                sb.append('WeekBasedYear,').append(this._count).append(',')
                    .append(19).append(',')
                    .append(String((this._count < 4) ? SignStyle.NORMAL : SignStyle.EXCEEDS_PAD));
            }
        }
        else {
            if (this._letter === 'c' || this._letter === 'e') {
                sb.append('DayOfWeek');
            }
            else if (this._letter === 'w') {
                sb.append('WeekOfWeekBasedYear');
            }
            else if (this._letter === 'W') {
                sb.append('WeekOfMonth');
            }
            sb.append(',');
            sb.append(this._count);
        }
        sb.append(')');
        return sb.toString();
    }
}
