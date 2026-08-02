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
    TemporalAccessor,
    TemporalQueries,
    TemporalQuery,
    UnsupportedTemporalTypeException,
    Year,
    ZoneId,
    type Temporal,
    type TemporalField,
    type ValueRange,
} from '@js-joda/core';
import { requireInstance, requireNonNull } from './assert';
import { MathUtil } from './math';

type DayOfYearType = typeof DayOfYear & { VALUES: DayOfYear[] };
type IsoChronologyType = typeof IsoChronology & { INSTANCE: IsoChronology };
const ISO = (IsoChronology as IsoChronologyType).INSTANCE;

function values(): DayOfYear[] {
    return (DayOfYear as DayOfYearType).VALUES;
}

/** A day-of-year in the ISO-8601 calendar system. */
export class DayOfYear extends TemporalAccessor {
    private readonly _day: number;

    static now(): DayOfYear;
    static now(zoneIdOrClock: ZoneId | Clock): DayOfYear;
    static now(zoneIdOrClock?: unknown): DayOfYear {
        switch (arguments.length) {
            case 0:
                return DayOfYear._now0();
            case 1: {
                const input = requireNonNull(zoneIdOrClock, 'clockOrZone');
                if (input instanceof ZoneId) {
                    return DayOfYear._nowZoneId(input);
                }
                if (input instanceof Clock) {
                    return DayOfYear._nowClock(input);
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

    static _now0(): DayOfYear {
        return DayOfYear.now(Clock.systemDefaultZone());
    }

    static _nowZoneId(zone: ZoneId): DayOfYear {
        return DayOfYear.now(Clock.system(zone));
    }

    static _nowClock(clock: Clock): DayOfYear {
        const now = LocalDate.now(clock);
        return DayOfYear.of(now.dayOfYear());
    }

    static of(dayOfYear: number): DayOfYear {
        if (1 <= dayOfYear && dayOfYear <= 366) {
            return values()[dayOfYear - 1]!;
        }
        throw new DateTimeException(`Invalid value for DayOfYear: ${dayOfYear}`);
    }

    static from(temporal: TemporalAccessor): DayOfYear {
        requireNonNull(temporal, 'temporal');
        requireInstance(temporal, TemporalAccessor, 'temporal');
        if (temporal instanceof DayOfYear) {
            return temporal;
        }
        try {
            return DayOfYear.of(temporal.get(ChronoField.DAY_OF_YEAR));
        } catch (error) {
            throw new DateTimeException(
                `Unable to obtain DayOfYear from TemporalAccessor: ${temporal} of type ${temporal.constructor.name}`,
                error as Error,
            );
        }
    }

    constructor(dayOfYear: number) {
        super();
        this._day = MathUtil.safeToInt(dayOfYear);
    }

    value(): number {
        return this._day;
    }

    override isSupported(field: TemporalField | null): boolean {
        if (field instanceof ChronoField) {
            return field === ChronoField.DAY_OF_YEAR;
        }
        return field != null && field.isSupportedBy(this);
    }

    override range(field: TemporalField): ValueRange {
        requireNonNull(field, 'field');
        if (field === ChronoField.DAY_OF_YEAR) {
            return field.range();
        }
        return super.range(field);
    }

    override get(field: TemporalField): number {
        return this.range(field).checkValidIntValue(this.getLong(field), field);
    }

    override getLong(field: TemporalField): number {
        requireNonNull(field, 'field');
        if (field === ChronoField.DAY_OF_YEAR) {
            return this._day;
        }
        if (field instanceof ChronoField) {
            throw new UnsupportedTemporalTypeException(`Unsupported field: ${field}`);
        }
        return field.getFrom(this);
    }

    isValidYear(year: number): boolean {
        return this._day < 366 || Year.isLeap(year);
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
        return temporal.with(ChronoField.DAY_OF_YEAR, this._day);
    }

    atYear(year: number | Year): LocalDate {
        requireNonNull(year, 'year');
        if (year instanceof Year) {
            return year.atDay(this._day);
        }
        return LocalDate.ofYearDay(year, this._day);
    }

    compareTo(other: DayOfYear): number {
        requireNonNull(other, 'other');
        requireInstance(other, DayOfYear, 'other');
        return this._day - other._day;
    }

    equals(obj: unknown): boolean {
        if (this === obj) {
            return true;
        }
        return obj instanceof DayOfYear && this._day === obj._day;
    }

    hashCode(): number {
        return this._day;
    }

    override toString(): string {
        return `DayOfYear:${this._day}`;
    }
}

export function _init(): void {
    const type = DayOfYear as DayOfYearType;
    type.VALUES = new Array<DayOfYear>(366);
    for (let i = 0; i < 366; i += 1) {
        type.VALUES[i] = new DayOfYear(i + 1);
    }
}
