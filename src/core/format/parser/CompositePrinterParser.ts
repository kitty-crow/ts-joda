import type { DateTimeParseContext } from "../DateTimeParseContext.ts";
import type { DateTimePrintContext } from "../DateTimePrintContext.ts";
import type { StringBuilder } from "../StringBuilder.ts";
import type { DateTimePrinterParser } from "./DateTimePrinterParser.ts";
/**
 * @copyright (c) 2016, Philipp Thürwächter & Pattrick Hüper
 * @copyright (c) 2007-present, Stephen Colebourne & Michael Nascimento Santos
 * @license BSD-3-Clause (see LICENSE in the root directory of this source tree)
 */
/**
 * @private
 */
export class CompositePrinterParser implements DateTimePrinterParser {
    private readonly _printerParsers: readonly DateTimePrinterParser[];
    private readonly _optional: boolean;
    constructor(printerParsers: readonly DateTimePrinterParser[], optional: boolean) {
        this._printerParsers = printerParsers;
        this._optional = optional;
    }
    /**
     * Returns a copy of this printer-parser with the optional flag changed.
     *
     * @param {boolean} optional  the optional flag to set in the copy
     * @return {CompositePrinterParser} the new printer-parser, not null
     */
    withOptional(optional: boolean): CompositePrinterParser {
        if (optional === this._optional) {
            return this;
        }
        return new CompositePrinterParser(this._printerParsers, optional);
    }
    print(context: DateTimePrintContext, buf: StringBuilder): boolean {
        const length = buf.length();
        if (this._optional) {
            context.startOptional();
        }
        try {
            for (let i = 0; i < this._printerParsers.length; i++) {
                const pp = this._printerParsers[i]!;
                if (pp.print(context, buf) === false) {
                    buf.setLength(length); // reset buffer
                    return true;
                }
            }
        }
        finally {
            if (this._optional) {
                context.endOptional();
            }
        }
        return true;
    }
    parse(context: DateTimeParseContext, text: string, position: number): number {
        if (this._optional) {
            context.startOptional();
            let pos = position;
            for (let i = 0; i < this._printerParsers.length; i++) {
                const pp = this._printerParsers[i]!;
                pos = pp.parse(context, text, pos);
                if (pos < 0) {
                    context.endOptional(false);
                    return position; // return original position
                }
            }
            context.endOptional(true);
            return pos;
        }
        else {
            for (let i = 0; i < this._printerParsers.length; i++) {
                const pp = this._printerParsers[i]!;
                position = pp.parse(context, text, position);
                if (position < 0) {
                    break;
                }
            }
            return position;
        }
    }
    toString(): string {
        let buf = '';
        if (this._printerParsers != null) {
            buf += this._optional ? '[' : '(';
            for (let i = 0; i < this._printerParsers.length; i++) {
                const pp = this._printerParsers[i]!;
                buf += pp.toString();
            }
            buf += this._optional ? ']' : ')';
        }
        return buf;
    }
}
