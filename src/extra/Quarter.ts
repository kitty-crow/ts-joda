/*
 * @copyright (c) 2016, Philipp Thürwächter & Pattrick Hüper & Michał Sobkiewicz
 * @copyright (c) 2007-present, Stephen Colebourne & Michael Nascimento Santos
 * @license BSD-3-Clause (see LICENSE in the root directory of this source tree)
 */

import {
    ChronoField,
    DateTimeException,
    IllegalArgumentException,
    IllegalStateException,
    IsoChronology,
    IsoFields,
    Month,
    TemporalAccessor,
    TemporalField,
    TemporalQueries,
    TemporalQuery,
    UnsupportedTemporalTypeException,
    type Temporal,
    type TemporalAdjuster,
    type ValueRange,
} from '@js-joda/core';
import { requireInstance, requireNonNull } from './assert.ts';
import { MathUtil } from './math.ts';

interface QuarterStatics {
    Q1: Quarter;
    Q2: Quarter;
    Q3: Quarter;
    Q4: Quarter;
    FROM: TemporalQuery<Quarter>;
}

type IsoChronologyType = typeof IsoChronology & { INSTANCE: IsoChronology };
type QueryCtor<R> = new (name: string) => TemporalQuery<R>;

const ISO = (IsoChronology as IsoChronologyType).INSTANCE;
let QUARTERS: Quarter[];

function type(): typeof Quarter & QuarterStatics {
    return Quarter as typeof Quarter & QuarterStatics;
}

/** A quarter-of-year, such as `Q2`. */
export class Quarter extends TemporalAccessor implements TemporalAdjuster {
    private readonly _value: number;
    private readonly _name: string;

    static override valueOf(name: string): Quarter {
        requireNonNull(name, 'name');
        switch (name) {
            case 'Q1':
                return type().Q1;
            case 'Q2':
                return type().Q2;
            case 'Q3':
                return type().Q3;
            case 'Q4':
                return type().Q4;
            default:
                throw new IllegalArgumentException(`No enum constant Quarter.${name}`);
        }
    }

    static values(): Quarter[] {
        return QUARTERS.slice();
    }

    static of(quarterOfYear: number): Quarter {
        requireNonNull(quarterOfYear, 'quarterOfYear');
        switch (quarterOfYear) {
            case 1:
                return type().Q1;
            case 2:
                return type().Q2;
            case 3:
                return type().Q3;
            case 4:
                return type().Q4;
            default:
                throw new DateTimeException(`Invalid value for Quarter: ${quarterOfYear}`);
        }
    }

    static ofMonth(monthOfYear: number): Quarter {
        requireNonNull(monthOfYear, 'monthOfYear');
        ChronoField.MONTH_OF_YEAR.range().checkValidValue(monthOfYear, ChronoField.MONTH_OF_YEAR);
        return Quarter.of(MathUtil.intDiv(monthOfYear - 1, 3) + 1);
    }

    static from(temporal: TemporalAccessor): Quarter;
    static from(temporal: unknown): Quarter {
        if (temporal instanceof Quarter) {
            return temporal;
        }
        if (temporal instanceof Month) {
            return Quarter.of(MathUtil.intDiv(temporal.ordinal(), 3) + 1);
        }

        try {
            const input = temporal as TemporalAccessor;
            const quarter = MathUtil.safeToInt(input.getLong(IsoFields.QUARTER_OF_YEAR));
            return Quarter.of(quarter);
        } catch (error) {
            const actual = temporal
                && (temporal as { readonly constructor: { readonly name: string } }).constructor.name;
            throw new DateTimeException(
                `Unable to obtain Quarter from TemporalAccessor: '${temporal}' of type '${actual}'`,
                error as Error,
            );
        }
    }

    constructor(value: number, name: string) {
        super();
        this._value = MathUtil.safeToInt(value);
        this._name = name;
    }

    value(): number {
        return this._value;
    }

    displayName(_style: unknown, _locale: unknown): never {
        throw new IllegalArgumentException('Pattern using (localized) text not implemented yet!');
    }

    override isSupported(field: TemporalField | null): boolean {
        if (field === IsoFields.QUARTER_OF_YEAR) {
            return true;
        }
        if (field instanceof ChronoField) {
            return false;
        }
        return field != null && field.isSupportedBy(this);
    }

    override range(field: TemporalField): ValueRange {
        requireNonNull(field, 'field');
        if (field === IsoFields.QUARTER_OF_YEAR) {
            return field.range();
        }
        if (field instanceof ChronoField) {
            throw new UnsupportedTemporalTypeException(`Unsupported field: ${field}`);
        }
        return super.range(field);
    }

    override get(field: TemporalField): number {
        requireNonNull(field, 'field');
        requireInstance(field, TemporalField, 'field');
        return this.range(field).checkValidIntValue(this.getLong(field), field);
    }

    override getLong(field: TemporalField): number {
        requireNonNull(field, 'field');
        if (field === IsoFields.QUARTER_OF_YEAR) {
            return this.value();
        }
        if (field instanceof ChronoField) {
            throw new UnsupportedTemporalTypeException(`Unsupported field: ${field}`);
        }
        return field.getFrom(this);
    }

    plus(quarters: number): Quarter {
        const amount = MathUtil.intMod(quarters, 4);
        return QUARTERS[(this.ordinal() + amount + 4) % 4]!;
    }

    minus(quarters: number): Quarter {
        return this.plus(-MathUtil.intMod(quarters, 4));
    }

    length(leapYear: boolean): number {
        switch (this) {
            case type().Q1:
                return leapYear ? 91 : 90;
            case type().Q2:
                return 91;
            default:
                return 92;
        }
    }

    firstMonth(): Month {
        switch (this) {
            case type().Q1:
                return Month.JANUARY;
            case type().Q2:
                return Month.APRIL;
            case type().Q3:
                return Month.JULY;
            case type().Q4:
                return Month.OCTOBER;
            default:
                throw new IllegalStateException('Unreachable');
        }
    }

    override query<R>(query: TemporalQuery<R>): R | null {
        requireNonNull(query, 'query');
        requireInstance(query, TemporalQuery, 'query');
        if (query === TemporalQueries.chronology()) {
            return ISO as unknown as R;
        }
        if (query === TemporalQueries.precision()) {
            return IsoFields.QUARTER_YEARS as unknown as R;
        }
        return super.query(query);
    }

    adjustInto<T extends Temporal>(temporal: T): T {
        requireNonNull(temporal, 'temporal');
        return temporal.with(IsoFields.QUARTER_OF_YEAR, this.value());
    }

    ordinal(): number {
        return this._value - 1;
    }

    name(): string {
        return this._name;
    }

    compareTo(other: Quarter): number {
        requireNonNull(other, 'other');
        requireInstance(other, Quarter, 'other');
        return this._value - other._value;
    }

    override toString(): string {
        return this.name();
    }

    equals(other: unknown): boolean {
        return this === other;
    }

    hashCode(): number {
        return this._value;
    }
}

export function _init(): void {
    const quarter = type();
    quarter.Q1 = new Quarter(1, 'Q1');
    quarter.Q2 = new Quarter(2, 'Q2');
    quarter.Q3 = new Quarter(3, 'Q3');
    quarter.Q4 = new Quarter(4, 'Q4');
    quarter.FROM = createTemporalQuery('Quarter.FROM', (temporal) => Quarter.from(temporal));
    QUARTERS = [quarter.Q1, quarter.Q2, quarter.Q3, quarter.Q4];
}

function createTemporalQuery<R>(
    name: string,
    queryFrom: (temporal: TemporalAccessor) => R,
): TemporalQuery<R> {
    abstract class ExtendedTemporalQuery extends TemporalQuery<R> {}
    const Query = ExtendedTemporalQuery as unknown as QueryCtor<R>;
    Query.prototype.queryFrom = queryFrom;
    return new Query(name);
}
