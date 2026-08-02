import { assert, requireNonNull } from '../assert.ts';
import { Period } from '../Period.ts';
import { ZoneId } from '../ZoneId.ts';
import { IsoChronology } from '../chrono/IsoChronology.ts';
import { Temporal } from '../temporal/Temporal.ts';
import type { TemporalField } from '../temporal/TemporalField.ts';
import { TemporalQueries } from '../temporal/TemporalQueries.ts';
import type { TemporalQuery } from '../temporal/TemporalQuery.ts';
import type { TemporalUnit } from '../temporal/TemporalUnit.ts';
import { DateTimeBuilder } from './DateTimeBuilder.ts';
import { DateTimeFormatter } from './DateTimeFormatter.ts';
import type { DecimalStyle } from './DecimalStyle.ts';
import { EnumMap } from './EnumMap.ts';

/** Mutable context used while parsing a date-time string. */
export class DateTimeParseContext {
    private _caseSensitive = true;
    private _strict = true;
    private _parsed: Parsed[];
    private _locale: unknown;
    private _symbols: DecimalStyle;
    private _overrideChronology: IsoChronology | null;
    private _overrideZone: ZoneId | null = null;

    constructor(formatter: DateTimeFormatter);
    constructor(other: DateTimeParseContext);
    constructor(locale: unknown, symbols: DecimalStyle, chronology?: IsoChronology | null);
    constructor(
        formatterOrLocale: DateTimeFormatter | DateTimeParseContext | unknown,
        symbols?: DecimalStyle,
        chronology: IsoChronology | null = null,
    ) {
        if (formatterOrLocale instanceof DateTimeParseContext) {
            this._locale = formatterOrLocale._locale;
            this._symbols = formatterOrLocale._symbols;
            this._overrideChronology = formatterOrLocale._overrideChronology;
            this._overrideZone = formatterOrLocale._overrideZone;
            this._caseSensitive = formatterOrLocale._caseSensitive;
            this._strict = formatterOrLocale._strict;
        }
        else if (formatterOrLocale instanceof DateTimeFormatter) {
            this._locale = formatterOrLocale.locale();
            this._symbols = formatterOrLocale.decimalStyle();
            this._overrideChronology = formatterOrLocale.chronology() as IsoChronology | null;
            this._overrideZone = formatterOrLocale.zone();
        }
        else {
            if (symbols === undefined) {
                throw new TypeError('DecimalStyle is required');
            }
            this._locale = formatterOrLocale;
            this._symbols = symbols;
            this._overrideChronology = chronology;
        }
        this._parsed = [new Parsed(this)];
    }

    copy(): DateTimeParseContext {
        return new DateTimeParseContext(this);
    }

    symbols(): DecimalStyle {
        return this._symbols;
    }

    isStrict(): boolean {
        return this._strict;
    }

    setStrict(strict: boolean): void {
        this._strict = strict;
    }

    locale(): unknown {
        return this._locale;
    }

    setLocale(locale: unknown): void {
        this._locale = locale;
    }

    startOptional(): void {
        this._parsed.push(this.currentParsed().copy());
    }

    endOptional(successful: boolean): void {
        this._parsed.splice(this._parsed.length - (successful ? 2 : 1), 1);
    }

    isCaseSensitive(): boolean {
        return this._caseSensitive;
    }

    setCaseSensitive(caseSensitive: boolean): void {
        this._caseSensitive = caseSensitive;
    }

    subSequenceEquals(
        first: string,
        firstOffset: number,
        second: string,
        secondOffset: number,
        length: number,
    ): boolean {
        if (firstOffset + length > first.length || secondOffset + length > second.length) {
            return false;
        }
        if (!this._caseSensitive) {
            first = first.toLowerCase();
            second = second.toLowerCase();
        }
        return first.slice(firstOffset, firstOffset + length) === second.slice(secondOffset, secondOffset + length);
    }

    charEquals(first: string, second: string): boolean {
        return this._caseSensitive ? first === second : this.charEqualsIgnoreCase(first, second);
    }

    charEqualsIgnoreCase(first: string, second: string): boolean {
        return first === second || first.toLowerCase() === second.toLowerCase();
    }

    setParsedField(field: TemporalField, value: number, errorPosition: number, successPosition: number): number {
        const values = this.currentParsed().fieldValues;
        const old = values.get(field);
        values.set(field, value);
        return old != null && old !== value ? ~errorPosition : successPosition;
    }

    setParsedZone(zone: ZoneId): void {
        requireNonNull(zone, 'zone');
        this.currentParsed().zone = zone;
    }

    getParsed(field: TemporalField): number | undefined {
        return this.currentParsed().fieldValues.get(field);
    }

    toParsed(): Parsed {
        return this.currentParsed();
    }

    currentParsed(): Parsed {
        return this._parsed[this._parsed.length - 1]!;
    }

    setParsedLeapSecond(): void {
        this.currentParsed().leapSecond = true;
    }

    getEffectiveChronology(): IsoChronology {
        return this.currentParsed().chrono ?? this._overrideChronology ?? IsoChronology.INSTANCE;
    }

    overrideZone(): ZoneId | null {
        return this._overrideZone;
    }
}

export class Parsed extends Temporal {
    chrono: IsoChronology | null = null;
    zone: ZoneId | null = null;
    fieldValues = new EnumMap();
    leapSecond = false;
    excessDays = Period.ZERO;

    constructor(private readonly context: DateTimeParseContext) {
        super();
    }

    copy(): Parsed {
        const copy = new Parsed(this.context);
        copy.chrono = this.chrono;
        copy.zone = this.zone;
        copy.fieldValues.putAll(this.fieldValues);
        copy.leapSecond = this.leapSecond;
        copy.excessDays = this.excessDays;
        return copy;
    }

    toString(): string {
        return `${this.fieldValues}, ${this.chrono}, ${this.zone}`;
    }

    isSupported(fieldOrUnit: TemporalField | TemporalUnit): boolean {
        return this.fieldValues.containsKey(fieldOrUnit as TemporalField);
    }

    override get(field: TemporalField): number {
        const value = this.fieldValues.get(field);
        assert(value != null);
        return value;
    }

    query<R>(query: TemporalQuery<R>): R | null {
        if (query === TemporalQueries.chronology()) {
            return this.chrono as unknown as R;
        }
        if (query === TemporalQueries.zoneId() || query === TemporalQueries.zone()) {
            return this.zone as unknown as R;
        }
        return super.query(query);
    }

    toBuilder(): DateTimeBuilder {
        const builder = new DateTimeBuilder();
        builder.fieldValues.putAll(this.fieldValues);
        builder.chrono = this.context.getEffectiveChronology();
        builder.zone = this.zone ?? this.context.overrideZone();
        builder.leapSecond = this.leapSecond;
        builder.excessDays = this.excessDays;
        return builder;
    }
}
