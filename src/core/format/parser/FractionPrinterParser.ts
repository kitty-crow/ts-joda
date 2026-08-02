import { requireNonNull } from '../../assert.ts';
import { IllegalArgumentException } from '../../errors.ts';
import { MathUtil } from '../../MathUtil.ts';
import type { TemporalField } from '../../temporal/TemporalField.ts';
import type { DateTimeParseContext } from '../DateTimeParseContext.ts';
import type { DateTimePrintContext } from '../DateTimePrintContext.ts';
import type { StringBuilder } from '../StringBuilder.ts';
import type { DateTimePrinterParser } from './DateTimePrinterParser.ts';

/** Prints and parses a numeric date-time field as a fractional value. */
export class FractionPrinterParser implements DateTimePrinterParser {
    constructor(
        readonly field: TemporalField,
        readonly minWidth: number,
        readonly maxWidth: number,
        readonly decimalPoint: boolean,
    ) {
        requireNonNull(field, 'field');
        if (!field.range().isFixed()) {
            throw new IllegalArgumentException(`Field must have a fixed set of values: ${field}`);
        }
        if (minWidth < 0 || minWidth > 9) {
            throw new IllegalArgumentException(`Minimum width must be from 0 to 9 inclusive but was ${minWidth}`);
        }
        if (maxWidth < 1 || maxWidth > 9) {
            throw new IllegalArgumentException(`Maximum width must be from 1 to 9 inclusive but was ${maxWidth}`);
        }
        if (maxWidth < minWidth) {
            throw new IllegalArgumentException(`Maximum width must exceed or equal the minimum width but ${maxWidth} < ${minWidth}`);
        }
    }

    print(context: DateTimePrintContext, buffer: StringBuilder): boolean {
        const value = context.getValue(this.field);
        if (value == null) {
            return false;
        }
        const symbols = context.symbols();
        if (value === 0) {
            if (this.minWidth > 0) {
                if (this.decimalPoint) {
                    buffer.append(symbols.decimalSeparator());
                }
                for (let index = 0; index < this.minWidth; index++) {
                    buffer.append(symbols.zeroDigit());
                }
            }
            return true;
        }

        let fraction = this.convertToFraction(value, symbols.zeroDigit());
        fraction = fraction.slice(0, Math.min(Math.max(fraction.length, this.minWidth), this.maxWidth));
        if (Number(fraction) > 0) {
            while (fraction.length > this.minWidth && fraction.endsWith('0')) {
                fraction = fraction.slice(0, -1);
            }
        }
        if (this.decimalPoint) {
            buffer.append(symbols.decimalSeparator());
        }
        buffer.append(symbols.convertNumberToI18N(fraction));
        return true;
    }

    parse(context: DateTimeParseContext, text: string, position: number): number {
        const effectiveMin = context.isStrict() ? this.minWidth : 0;
        const effectiveMax = context.isStrict() ? this.maxWidth : 9;
        if (position === text.length) {
            return effectiveMin > 0 ? ~position : position;
        }
        if (this.decimalPoint) {
            if (text.charAt(position) !== context.symbols().decimalSeparator()) {
                return effectiveMin > 0 ? ~position : position;
            }
            position++;
        }
        const minimumEnd = position + effectiveMin;
        if (minimumEnd > text.length) {
            return ~position;
        }
        const maximumEnd = Math.min(position + effectiveMax, text.length);
        let total = 0;
        let current = position;
        while (current < maximumEnd) {
            const digit = context.symbols().convertToDigit(text.charAt(current++));
            if (digit < 0) {
                if (current < minimumEnd) {
                    return ~position;
                }
                current--;
                break;
            }
            total = total * 10 + digit;
        }
        const value = this.convertFromFraction(total, 10 ** (current - position));
        return context.setParsedField(this.field, value, position, current);
    }

    convertToFraction(value: number, zeroDigit: string): string {
        const range = this.field.range();
        range.checkValidValue(value, this.field);
        const minimum = range.minimum();
        const width = range.maximum() - minimum + 1;
        const scaled = MathUtil.intDiv((value - minimum) * 1_000_000_000, width);
        return String(scaled).padStart(9, zeroDigit);
    }

    convertFromFraction(total: number, scale: number): number {
        const range = this.field.range();
        const minimum = range.minimum();
        const width = range.maximum() - minimum + 1;
        return MathUtil.intDiv(total * width, scale);
    }

    toString(): string {
        const decimal = this.decimalPoint ? ',DecimalPoint' : '';
        return `Fraction(${this.field},${this.minWidth},${this.maxWidth}${decimal})`;
    }
}
