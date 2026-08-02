/**
 * @copyright (c) 2016, Philipp Thürwächter & Pattrick Hüper
 * @copyright (c) 2007-present, Stephen Colebourne & Michael Nascimento Santos
 * @license BSD-3-Clause (see LICENSE in the root directory of this source tree)
 */
import { assert } from "../../assert.ts";
import type { DateTimeParseContext } from "../DateTimeParseContext.ts";
import type { DateTimePrintContext } from "../DateTimePrintContext.ts";
import type { StringBuilder } from "../StringBuilder.ts";
import type { DateTimePrinterParser } from "./DateTimePrinterParser.ts";
/**
 * Prints or parses a string literal.
 * @private
 */
export class StringLiteralPrinterParser implements DateTimePrinterParser {
    private readonly _literal: string;
    constructor(literal: string) {
        this._literal = literal;
    }
    print(_context: DateTimePrintContext, buf: StringBuilder): boolean {
        buf.append(this._literal);
        return true;
    }
    parse(context: DateTimeParseContext, text: string, position: number): number {
        const length = text.length;
        assert(!(position > length || position < 0));
        if (context.subSequenceEquals(text, position, this._literal, 0, this._literal.length) === false) {
            return ~position;
        }
        return position + this._literal.length;
    }
    toString(): string {
        const converted = this._literal.replace("'", "''");
        return `'${converted}'`;
    }
}
