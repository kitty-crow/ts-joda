import { assert } from '../../assert.ts';
import type { ChronoLocalDate } from '../../chrono/ChronoLocalDate.ts';
import { IsoChronology } from '../../chrono/IsoChronology.ts';
import { ArithmeticException, DateTimeException, IllegalArgumentException } from '../../errors.ts';
import { MathUtil } from '../../MathUtil.ts';
import type { TemporalField } from '../../temporal/TemporalField.ts';
import type { DateTimeParseContext } from '../DateTimeParseContext.ts';
import type { DateTimePrintContext } from '../DateTimePrintContext.ts';
import { SignStyle } from '../SignStyle.ts';
import type { StringBuilder } from '../StringBuilder.ts';
import type { DateTimePrinterParser } from './DateTimePrinterParser.ts';

const MAX_WIDTH = 15;
const EXCEED_POINTS = [
    0, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000,
] as const;

/** Prints and parses a numeric temporal field. */
export class NumberPrinterParser implements DateTimePrinterParser {
    protected readonly _field: TemporalField;
    protected readonly _minWidth: number;
    protected readonly _maxWidth: number;
    protected readonly _signStyle: SignStyle;
    protected readonly _subsequentWidth: number;

    constructor(
        field: TemporalField,
        minWidth: number,
        maxWidth: number,
        signStyle: SignStyle,
        subsequentWidth = 0,
    ) {
        this._field = field;
        this._minWidth = minWidth;
        this._maxWidth = maxWidth;
        this._signStyle = signStyle;
        this._subsequentWidth = subsequentWidth;
    }

    field(): TemporalField { return this._field; }
    minWidth(): number { return this._minWidth; }
    maxWidth(): number { return this._maxWidth; }
    signStyle(): SignStyle { return this._signStyle; }

    withFixedWidth(): NumberPrinterParser {
        return this._subsequentWidth === -1
            ? this
            : new NumberPrinterParser(this._field, this._minWidth, this._maxWidth, this._signStyle, -1);
    }

    withSubsequentWidth(subsequentWidth: number): NumberPrinterParser {
        return new NumberPrinterParser(
            this._field,
            this._minWidth,
            this._maxWidth,
            this._signStyle,
            this._subsequentWidth + subsequentWidth,
        );
    }

    protected isFixedWidth(): boolean {
        return this._subsequentWidth === -1
            || (this._subsequentWidth > 0
                && this._minWidth === this._maxWidth
                && this._signStyle === SignStyle.NOT_NEGATIVE);
    }

    print(context: DateTimePrintContext, buffer: StringBuilder): boolean {
        const contextValue = context.getValue(this._field);
        if (contextValue == null) {
            return false;
        }
        const value = this.getValue(context, contextValue);
        const symbols = context.symbols();
        let text = symbols.convertNumberToI18N(String(Math.abs(value)));
        if (text.length > this._maxWidth) {
            throw new DateTimeException(
                `Field ${this._field} cannot be printed as the value ${value} `
                + `exceeds the maximum print width of ${this._maxWidth}`,
            );
        }

        if (value >= 0) {
            if (
                this._signStyle === SignStyle.EXCEEDS_PAD
                && this._minWidth < MAX_WIDTH
                && value >= (EXCEED_POINTS[this._minWidth] ?? Number.POSITIVE_INFINITY)
            ) {
                buffer.append(symbols.positiveSign());
            }
            else if (this._signStyle === SignStyle.ALWAYS) {
                buffer.append(symbols.positiveSign());
            }
        }
        else if (
            this._signStyle === SignStyle.NORMAL
            || this._signStyle === SignStyle.EXCEEDS_PAD
            || this._signStyle === SignStyle.ALWAYS
        ) {
            buffer.append(symbols.negativeSign());
        }
        else if (this._signStyle === SignStyle.NOT_NEGATIVE) {
            throw new DateTimeException(
                `Field ${this._field} cannot be printed as the value ${value} cannot be negative`,
            );
        }

        while (text.length < this._minWidth) {
            text = symbols.zeroDigit() + text;
        }
        buffer.append(text);
        return true;
    }

    parse(context: DateTimeParseContext, text: string, position: number): number {
        const length = text.length;
        if (position === length) {
            return ~position;
        }
        assert(position >= 0 && position < length);
        const sign = text.charAt(position);
        let negative = false;
        let positive = false;
        if (sign === context.symbols().positiveSign()) {
            if (!this._signStyle.parse(true, context.isStrict(), this._minWidth === this._maxWidth)) {
                return ~position;
            }
            positive = true;
            position++;
        }
        else if (sign === context.symbols().negativeSign()) {
            if (!this._signStyle.parse(false, context.isStrict(), this._minWidth === this._maxWidth)) {
                return ~position;
            }
            negative = true;
            position++;
        }
        else if (this._signStyle === SignStyle.ALWAYS && context.isStrict()) {
            return ~position;
        }

        const strictOrFixed = context.isStrict() || this.isFixedWidth();
        const effectiveMinWidth = strictOrFixed ? this._minWidth : 1;
        const minimumEnd = position + effectiveMinWidth;
        if (minimumEnd > length) {
            return ~position;
        }

        let effectiveMaxWidth = (strictOrFixed ? this._maxWidth : 9) + Math.max(this._subsequentWidth, 0);
        let total = 0;
        let current = position;
        for (let pass = 0; pass < 2; pass++) {
            const maximumEnd = Math.min(current + effectiveMaxWidth, length);
            while (current < maximumEnd) {
                const digit = context.symbols().convertToDigit(text.charAt(current++));
                if (digit < 0) {
                    current--;
                    if (current < minimumEnd) {
                        return ~position;
                    }
                    break;
                }
                if (current - position > MAX_WIDTH) {
                    throw new ArithmeticException('number text exceeds length');
                }
                total = total * 10 + digit;
            }
            if (this._subsequentWidth > 0 && pass === 0) {
                effectiveMaxWidth = Math.max(effectiveMinWidth, current - position - this._subsequentWidth);
                current = position;
                total = 0;
            }
            else {
                break;
            }
        }

        if (negative) {
            if (total === 0 && context.isStrict()) {
                return ~(position - 1);
            }
            total = total === 0 ? 0 : -total;
        }
        else if (this._signStyle === SignStyle.EXCEEDS_PAD && context.isStrict()) {
            const parsedLength = current - position;
            if (positive ? parsedLength <= this._minWidth : parsedLength > this._minWidth) {
                return positive ? ~(position - 1) : ~position;
            }
        }
        return this.setValue(context, total, position, current);
    }

    protected getValue(_context: DateTimePrintContext, value: number): number {
        return value;
    }

    protected setValue(
        context: DateTimeParseContext,
        value: number,
        errorPosition: number,
        successPosition: number,
    ): number {
        return context.setParsedField(this._field, value, errorPosition, successPosition);
    }

    toString(): string {
        if (this._minWidth === 1 && this._maxWidth === MAX_WIDTH && this._signStyle === SignStyle.NORMAL) {
            return `Value(${this._field})`;
        }
        if (this._minWidth === this._maxWidth && this._signStyle === SignStyle.NOT_NEGATIVE) {
            return `Value(${this._field},${this._minWidth})`;
        }
        return `Value(${this._field},${this._minWidth},${this._maxWidth},${this._signStyle})`;
    }
}

/** Prints and parses a reduced numeric date-time field. */
export class ReducedPrinterParser extends NumberPrinterParser {
    static BASE_DATE: ChronoLocalDate;

    private readonly _baseValue: number;
    private readonly _baseDate: ChronoLocalDate | null;

    constructor(
        field: TemporalField,
        width: number,
        maxWidth: number,
        baseValue: number,
        baseDate: ChronoLocalDate | null,
        subsequentWidth = 0,
    ) {
        super(field, width, maxWidth, SignStyle.NOT_NEGATIVE, subsequentWidth);
        if (width < 1 || width > 10) {
            throw new IllegalArgumentException(`The width must be from 1 to 10 inclusive but was ${width}`);
        }
        if (maxWidth < 1 || maxWidth > 10 || maxWidth < width) {
            throw new IllegalArgumentException('The maxWidth must be between width and 10');
        }
        if (baseDate === null) {
            if (!field.range().isValidValue(baseValue)) {
                throw new IllegalArgumentException('The base value must be within the range of the field');
            }
            const point = EXCEED_POINTS[width]!;
            if (baseValue + point > MathUtil.MAX_SAFE_INTEGER) {
                throw new DateTimeException('The reduced value range exceeds the safe integer capacity');
            }
        }
        this._baseValue = baseValue;
        this._baseDate = baseDate;
    }

    protected override getValue(context: DateTimePrintContext, value: number): number {
        const absolute = Math.abs(value);
        let baseValue = this._baseValue;
        if (this._baseDate !== null) {
            context.temporal();
            baseValue = IsoChronology.INSTANCE.date(this._baseDate).get(this._field);
        }
        const point = EXCEED_POINTS[value >= baseValue && value < baseValue + EXCEED_POINTS[this._minWidth]!
            ? this._minWidth
            : this._maxWidth]!;
        return absolute % point;
    }

    protected override setValue(
        context: DateTimeParseContext,
        value: number,
        errorPosition: number,
        successPosition: number,
    ): number {
        let baseValue = this._baseValue;
        if (this._baseDate !== null) {
            baseValue = context.getEffectiveChronology().date(this._baseDate).get(this._field);
        }
        if (successPosition - errorPosition === this._minWidth && value >= 0) {
            const range = EXCEED_POINTS[this._minWidth]!;
            const lastPart = baseValue % range;
            value = baseValue > 0 ? baseValue - lastPart + value : baseValue - lastPart - value;
            if (value < baseValue) {
                value += range;
            }
        }
        return context.setParsedField(this._field, value, errorPosition, successPosition);
    }

    override withFixedWidth(): ReducedPrinterParser {
        return this._subsequentWidth === -1
            ? this
            : new ReducedPrinterParser(
                this._field,
                this._minWidth,
                this._maxWidth,
                this._baseValue,
                this._baseDate,
                -1,
            );
    }

    override withSubsequentWidth(subsequentWidth: number): ReducedPrinterParser {
        return new ReducedPrinterParser(
            this._field,
            this._minWidth,
            this._maxWidth,
            this._baseValue,
            this._baseDate,
            this._subsequentWidth + subsequentWidth,
        );
    }

    isFixedWidthFor(context: DateTimeParseContext): boolean {
        return context.isStrict() && this.isFixedWidth();
    }

    override toString(): string {
        return `ReducedValue(${this._field},${this._minWidth},${this._maxWidth},${this._baseDate ?? this._baseValue})`;
    }
}
