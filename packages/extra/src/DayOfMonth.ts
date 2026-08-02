/*
 * @copyright (c) 2022, Philipp Thürwächter & Pattrick Hüper & Michał Sobkiewicz
 * @copyright (c) 2007-present, Stephen Colebourne & Michael Nascimento Santos
 * @license BSD-3-Clause (see LICENSE in the root directory of this source tree)
 */

import {
    ChronoField,
    Clock,
    DateTimeException,
    IllegalArgumentException,
    IsoChronology,
    LocalDate,
    Month,
    MonthDay,
    TemporalAccessor,
    TemporalQueries,
    TemporalQuery,
    UnsupportedTemporalTypeException,
    ZoneId,
    type Temporal,
    type TemporalField,
    type ValueRange,
    type YearMonth,
} from '@js-joda/core';
import { requireInstance, requireNonNull } from './assert';
import { MathUtil } from './math';

type DayOfMonthType = typeof DayOfMonth & { VALUES: DayOfMonth[] };
type IsoChronologyType = typeof IsoChronology & { INSTANCE: IsoChronology };
const ISO = (IsoChronology as IsoChronologyType).INSTANCE;

function values(): DayOfMonth[] {
    return (DayOfMonth as DayOfMonthType).VALUES;
}

/** A day-of-month in the ISO-8601 calendar system. */
export class DayOfMonth extends TemporalAccessor {
    private readonly _day: number;

    static now(): DayOfMonth;
    static now(zoneIdOrClock: ZoneId | Clock): DayOfMonth;
    static now(zoneIdOrClock?: unknown): DayOfMonth {
        switch (arguments.length) {
            case 0:
                return DayOfMonth._now0();
            case 1: {
                const input = requireNonNull(zoneIdOrClock, 'clockOrZone');
                if (input instanceof ZoneId) {
                    return DayOfMonth._nowZoneId(input);
                }
                if (input instanceof Clock) {
                    return DayOfMonth._nowClock(input);
                }
                const value = input as { readonly constructor: { readonly name: string } };
                throw new IllegalArgumentException(
                    `zoneIdOrClock must be an instance of ZoneId or Clock, but is ${value.constructor.name}`,
                );
            }
            default:
                throw new IllegalArgumentException(`Invalid number of arguments: ${arguments.length}`);
        }
    }

    static _now0(): DayOfMonth {
        return this.now(Clock.systemDefaultZone());
    }

    static _nowZoneId(zone: ZoneId): DayOfMonth {
        return this.now(Clock.system(zone));
    }

    static _nowClock(clock: Clock): DayOfMonth {
        const now = LocalDate.now(clock);
        return DayOfMonth.of(now.dayOfMonth());
    }

    static of(dayOfMonth: number): DayOfMonth {
        if (1 <= dayOfMonth && dayOfMonth <= 31) {
            return values()[dayOfMonth - 1]!;
        }
        throw new DateTimeException(`Invalid value for DayOfMonth: ${dayOfMonth}`);
    }

    static from(temporal: TemporalAccessor): DayOfMonth {
        if (temporal instanceof DayOfMonth) {
            return temporal;
        }
        requireNonNull(temporal, 'temporal');
        try {
            return DayOfMonth.of(temporal.get(ChronoField.DAY_OF_MONTH));
        } catch (error) {
            throw new DateTimeException(
                `Unable to obtain DayOfMonth from TemporalAccessor: ${temporal} of type ${temporal.constructor.name}`,
                error as Error,
            );
        }
    }

    constructor(dayOfMonth: number) {
        super();
        this._day = MathUtil.safeToInt(dayOfMonth);
    }

    value(): number {
        return this._day;
    }

    override isSupported(field: TemporalField | null): boolean {
        if (field instanceof ChronoField) {
            return field === ChronoField.DAY_OF_MONTH;
        }
        return field != null && field.isSupportedBy(this);
    }

    override range(field: TemporalField): ValueRange {
        requireNonNull(field, 'field');
        if (field === ChronoField.DAY_OF_MONTH) {
            return field.range();
        }
        return super.range(field);
    }

    override get(field: TemporalField): number {
        return this.range(field).checkValidIntValue(this.getLong(field), field);
    }

    override getLong(field: TemporalField): number {
        requireNonNull(field, 'field');
        if (field === ChronoField.DAY_OF_MONTH) {
            return this._day;
        }
        if (field instanceof ChronoField) {
            throw new UnsupportedTemporalTypeException(`Unsupported field: ${field}`);
        }
        return field.getFrom(this);
    }

    isValidYearMonth(yearMonth: YearMonth | null): boolean {
        return yearMonth != null && yearMonth.isValidDay(this._day);
    }

    override query<R>(query: TemporalQuery<R>): R | null {
        requireNonNull(query, 'query');
        requireInstance(query, TemporalQuery, 'query');
        if (query === TemporalQueries.chronology()) {
            return ISO as unknown as R;
        }
        return super.query(query);
    }

    adjustInto(temporal: Temporal): Temporal {
        requireNonNull(temporal, 'temporal');
        return temporal.with(ChronoField.DAY_OF_MONTH, this._day);
    }

    atMonth(month: number | Month): MonthDay {
        requireNonNull(month, 'month');
        if (month instanceof Month) {
            return MonthDay.of(month, Math.min(this._day, month.maxLength()));
        }
        return MonthDay.of(month, Math.min(this._day, Month.of(month).maxLength()));
    }

    atYearMonth(yearMonth: YearMonth): LocalDate {
        requireNonNull(yearMonth, 'yearMonth');
        return yearMonth.atDay(Math.min(this._day, yearMonth.lengthOfMonth()));
    }

    compareTo(other: DayOfMonth): number {
        requireNonNull(other, 'other');
        requireInstance(other, DayOfMonth, 'other');
        return this._day - other._day;
    }

    equals(obj: unknown): boolean {
        if (this === obj) {
            return true;
        }
        return obj instanceof DayOfMonth && this._day === obj._day;
    }

    hashCode(): number {
        return this._day;
    }

    override toString(): string {
        return `DayOfMonth:${this._day}`;
    }
}

export function _init(): void {
    const type = DayOfMonth as DayOfMonthType;
    type.VALUES = new Array<DayOfMonth>(31);
    for (let i = 0; i < 31; i += 1) {
        type.VALUES[i] = new DayOfMonth(i + 1);
    }
}
