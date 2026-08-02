import { requireNonNull } from '../../assert.ts';
import { IllegalArgumentException } from '../../errors.ts';
import { MathUtil } from '../../MathUtil.ts';
import { ChronoField } from '../../temporal/ChronoField.ts';
import type { DateTimeParseContext } from '../DateTimeParseContext.ts';
import type { DateTimePrintContext } from '../DateTimePrintContext.ts';
import type { StringBuilder } from '../StringBuilder.ts';
import type { DateTimePrinterParser } from './DateTimePrinterParser.ts';

const PATTERNS = [
    '+HH', '+HHmm', '+HH:mm', '+HHMM', '+HH:MM', '+HHMMss', '+HH:MM:ss', '+HHMMSS', '+HH:MM:SS',
] as const;

/** Prints and parses an ISO zone offset identifier. */
export class OffsetIdPrinterParser implements DateTimePrinterParser {
    static INSTANCE_ID: OffsetIdPrinterParser;
    static PATTERNS: readonly string[];

    private readonly type: number;

    constructor(readonly noOffsetText: string, pattern: string) {
        requireNonNull(noOffsetText, 'noOffsetText');
        requireNonNull(pattern, 'pattern');
        this.type = this.checkPattern(pattern);
    }

    private checkPattern(pattern: string): number {
        const index = PATTERNS.indexOf(pattern as typeof PATTERNS[number]);
        if (index < 0) {
            throw new IllegalArgumentException(`Invalid zone offset pattern: ${pattern}`);
        }
        return index;
    }

    print(context: DateTimePrintContext, buffer: StringBuilder): boolean {
        const offsetSeconds = context.getValue(ChronoField.OFFSET_SECONDS);
        if (offsetSeconds == null) {
            return false;
        }
        const totalSeconds = MathUtil.safeToInt(offsetSeconds);
        if (totalSeconds === 0) {
            buffer.append(this.noOffsetText);
            return true;
        }

        const hours = Math.abs(MathUtil.intMod(MathUtil.intDiv(totalSeconds, 3600), 100));
        const minutes = Math.abs(MathUtil.intMod(MathUtil.intDiv(totalSeconds, 60), 60));
        const seconds = Math.abs(MathUtil.intMod(totalSeconds, 60));
        const start = buffer.length();
        let output = hours;
        buffer.append(totalSeconds < 0 ? '-' : '+').append(String(hours).padStart(2, '0'));
        if (this.type >= 3 || (this.type >= 1 && minutes > 0)) {
            buffer.append(this.type % 2 === 0 ? ':' : '').append(String(minutes).padStart(2, '0'));
            output += minutes;
            if (this.type >= 7 || (this.type >= 5 && seconds > 0)) {
                buffer.append(this.type % 2 === 0 ? ':' : '').append(String(seconds).padStart(2, '0'));
                output += seconds;
            }
        }
        if (output === 0) {
            buffer.setLength(start).append(this.noOffsetText);
        }
        return true;
    }

    parse(context: DateTimeParseContext, text: string, position: number): number {
        const noOffsetLength = this.noOffsetText.length;
        if (noOffsetLength === 0 && position === text.length) {
            return context.setParsedField(ChronoField.OFFSET_SECONDS, 0, position, position);
        }
        if (noOffsetLength > 0) {
            if (position === text.length) {
                return ~position;
            }
            if (context.subSequenceEquals(text, position, this.noOffsetText, 0, noOffsetLength)) {
                return context.setParsedField(
                    ChronoField.OFFSET_SECONDS,
                    0,
                    position,
                    position + noOffsetLength,
                );
            }
        }

        const sign = text.charAt(position);
        if (sign === '+' || sign === '-') {
            const values = [position + 1, 0, 0, 0];
            if (!(
                this.parseNumber(values, 1, text, true)
                || this.parseNumber(values, 2, text, this.type >= 3)
                || this.parseNumber(values, 3, text, false)
            )) {
                const seconds = MathUtil.safeZero((sign === '-' ? -1 : 1)
                    * (values[1]! * 3600 + values[2]! * 60 + values[3]!));
                return context.setParsedField(ChronoField.OFFSET_SECONDS, seconds, position, values[0]!);
            }
        }
        return noOffsetLength === 0
            ? context.setParsedField(ChronoField.OFFSET_SECONDS, 0, position, position)
            : ~position;
    }

    private parseNumber(
        values: number[],
        index: 1 | 2 | 3,
        text: string,
        required: boolean,
    ): boolean {
        if ((this.type + 3) / 2 < index) {
            return false;
        }
        let position = values[0]!;
        if (this.type % 2 === 0 && index > 1) {
            if (position + 1 > text.length || text.charAt(position) !== ':') {
                return required;
            }
            position++;
        }
        if (position + 2 > text.length) {
            return required;
        }
        const first = text.charAt(position++);
        const second = text.charAt(position++);
        if (!/\d/.test(first) || !/\d/.test(second)) {
            return required;
        }
        const value = Number(first + second);
        if (value > 59) {
            return required;
        }
        values[index] = value;
        values[0] = position;
        return false;
    }

    toString(): string {
        return `Offset(${PATTERNS[this.type]},'${this.noOffsetText.replace("'", "''")}')`;
    }
}

OffsetIdPrinterParser.INSTANCE_ID = new OffsetIdPrinterParser('Z', '+HH:MM:ss');
OffsetIdPrinterParser.PATTERNS = PATTERNS;
