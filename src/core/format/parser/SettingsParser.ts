/**
 * @copyright (c) 2016, Philipp Thürwächter & Pattrick Hüper
 * @copyright (c) 2007-present, Stephen Colebourne & Michael Nascimento Santos
 * @license BSD-3-Clause (see LICENSE in the root directory of this source tree)
 */
import { Enum } from "../../Enum.ts";
import type { DateTimeParseContext } from "../DateTimeParseContext.ts";
import type { DateTimePrintContext } from "../DateTimePrintContext.ts";
import type { StringBuilder } from "../StringBuilder.ts";
import type { DateTimePrinterParser } from "./DateTimePrinterParser.ts";
/**
 * @private
 */
export class SettingsParser extends Enum implements DateTimePrinterParser {
    static SENSITIVE: SettingsParser;
    static INSENSITIVE: SettingsParser;
    static STRICT: SettingsParser;
    static LENIENT: SettingsParser;
    print(_context: DateTimePrintContext, _buffer: StringBuilder): boolean {
        return true; // nothing to do here
    }
    parse(context: DateTimeParseContext, _text: string, position: number): number {
        // using ordinals to avoid javac synthetic inner class
        switch (this) {
            case SettingsParser.SENSITIVE:
                context.setCaseSensitive(true);
                break;
            case SettingsParser.INSENSITIVE:
                context.setCaseSensitive(false);
                break;
            case SettingsParser.STRICT:
                context.setStrict(true);
                break;
            case SettingsParser.LENIENT:
                context.setStrict(false);
                break;
        }
        return position;
    }
    toString(): string {
        // using ordinals to avoid javac synthetic inner class
        switch (this) {
            case SettingsParser.SENSITIVE: return 'ParseCaseSensitive(true)';
            case SettingsParser.INSENSITIVE: return 'ParseCaseSensitive(false)';
            case SettingsParser.STRICT: return 'ParseStrict(true)';
            case SettingsParser.LENIENT: return 'ParseStrict(false)';
            default: return this._name;
        }
    }
}
SettingsParser.SENSITIVE = new SettingsParser('SENSITIVE');
SettingsParser.INSENSITIVE = new SettingsParser('INSENSITIVE');
SettingsParser.STRICT = new SettingsParser('STRICT');
SettingsParser.LENIENT = new SettingsParser('LENIENT');
