import { assert } from '../../assert.ts';
import { DateTimeException } from '../../errors.ts';
import type { DateTimeParseContext } from '../DateTimeParseContext.ts';
import type { DateTimePrintContext } from '../DateTimePrintContext.ts';
import type { StringBuilder } from '../StringBuilder.ts';
import type { DateTimePrinterParser } from './DateTimePrinterParser.ts';

/** Pads another printer/parser to a fixed width. */
export class PadPrinterParserDecorator implements DateTimePrinterParser {
    constructor(
        private readonly _printerParser: DateTimePrinterParser,
        private readonly _padWidth: number,
        private readonly _padChar: string,
    ) {}

    print(context: DateTimePrintContext, buffer: StringBuilder): boolean {
        const start = buffer.length();
        if (!this._printerParser.print(context, buffer)) {
            return false;
        }
        const length = buffer.length() - start;
        if (length > this._padWidth) {
            throw new DateTimeException(
                `Cannot print as output of ${length} characters exceeds pad width of ${this._padWidth}`,
            );
        }
        for (let index = 0; index < this._padWidth - length; index++) {
            buffer.insert(start, this._padChar);
        }
        return true;
    }

    parse(context: DateTimeParseContext, text: string, position: number): number {
        const strict = context.isStrict();
        const caseSensitive = context.isCaseSensitive();
        assert(position <= text.length);
        assert(position >= 0);
        if (position === text.length) {
            return ~position;
        }
        let end = position + this._padWidth;
        if (end > text.length) {
            if (strict) {
                return ~position;
            }
            end = text.length;
        }
        let current = position;
        while (
            current < end
            && (caseSensitive
                ? text.charAt(current) === this._padChar
                : context.charEquals(text.charAt(current), this._padChar))
        ) {
            current++;
        }
        const result = this._printerParser.parse(context, text.slice(0, end), current);
        return result !== end && strict ? ~(position + current) : result;
    }

    toString(): string {
        return `Pad(${this._printerParser},${this._padWidth}${this._padChar === ' ' ? ')' : `,'${this._padChar}')`}`;
    }
}
