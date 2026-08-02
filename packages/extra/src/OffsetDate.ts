/**
 * @copyright (c) 2016, Philipp Thürwächter & Pattrick Hüper & Michał Sobkiewicz
 * @copyright (c) 2007-present, Stephen Colebourne & Michael Nascimento Santos
 * @license BSD-3-Clause (see LICENSE in the root directory of this source tree)
 */

import {
    ChronoField,
    ChronoUnit,
    Clock,
    DateTimeException,
    DateTimeFormatter,
    IllegalArgumentException,
    Instant,
    IsoChronology,
    LocalDate,
    LocalTime,
    Month,
    OffsetDateTime,
    Temporal,
    TemporalField,
    TemporalQueries,
    TemporalQuery,
    TemporalUnit,
    ZoneId,
    ZoneOffset,
    type DayOfWeek,
    type TemporalAccessor,
    type TemporalAdjuster,
    type ValueRange,
} from '@js-joda/core';
import { requireInstance, requireNonNull } from './assert';
import { MathUtil } from './math';

const SECONDS_PER_DAY = 86400;

interface OffsetDateStatics {
    MIN: OffsetDate;
    MAX: OffsetDate;
    FROM: TemporalQuery<OffsetDate>;
}

type IsoChronologyType = typeof IsoChronology & { INSTANCE: IsoChronology };
type QueryCtor<R> = new (name: string) => TemporalQuery<R>;

const ISO = (IsoChronology as IsoChronologyType).INSTANCE;

function type(): typeof OffsetDate & OffsetDateStatics {
    return OffsetDate as typeof OffsetDate & OffsetDateStatics;
}

/** A local date with an offset from UTC/Greenwich. */
export class OffsetDate extends Temporal implements TemporalAdjuster {
    private readonly _date: LocalDate;
    private readonly _offset: ZoneOffset;

    static now(): OffsetDate;
    static now(zoneIdOrClock: ZoneId | Clock): OffsetDate;
    static now(zoneIdOrClock?: unknown): OffsetDate {
        if (arguments.length === 0) {
            return OffsetDate._now0();
        }
        if (arguments.length === 1 && zoneIdOrClock instanceof ZoneId) {
            return OffsetDate._nowZoneId(zoneIdOrClock);
        }
        return OffsetDate._nowClock(zoneIdOrClock);
    }

    static _now0(): OffsetDate {
        return OffsetDate.now(Clock.systemDefaultZone());
    }

    static _nowZoneId(zone: ZoneId): OffsetDate {
        return OffsetDate.now(Clock.system(zone));
    }

    static _nowClock(clock: unknown): OffsetDate {
        const input = requireNonNull(clock, 'clock') as Clock;
        const now = input.instant();
        return OffsetDate.ofInstant(now, input.zone().rules().offset(now));
    }

    static of(date: LocalDate, offset: ZoneOffset): OffsetDate;
    static of(year: number, month: number, dayOfMonth: number, offset: ZoneOffset): OffsetDate;
    static of(...args: unknown[]): OffsetDate {
        switch (args.length) {
            case 2:
                return OffsetDate._ofLocalDateZoneOffset(args[0] as LocalDate, args[1] as ZoneOffset);
            case 4:
                return OffsetDate._ofIntIntIntZoneOffset(
                    args[0] as number,
                    args[1] as number,
                    args[2] as number,
                    args[3] as ZoneOffset,
                );
            default:
                throw new IllegalArgumentException('Illegal number of arguments');
        }
    }

    static _ofLocalDateZoneOffset(date: LocalDate, offset: ZoneOffset): OffsetDate {
        return new OffsetDate(date, offset);
    }

    static _ofIntIntIntZoneOffset(year: number, month: number, dayOfMonth: number, offset: ZoneOffset): OffsetDate {
        return new OffsetDate(LocalDate.of(year, month, dayOfMonth), offset);
    }

    static ofInstant(instant: Instant, zone: ZoneId): OffsetDate {
        requireNonNull(instant, 'instant');
        requireNonNull(zone, 'zone');
        const offset = zone.rules().offset(instant) as ZoneOffset;
        const epochSec = instant.epochSecond() + offset.totalSeconds();
        const epochDay = MathUtil.floorDiv(epochSec, SECONDS_PER_DAY);
        return new OffsetDate(LocalDate.ofEpochDay(epochDay), offset);
    }

    static from(temporal: TemporalAccessor): OffsetDate;
    static from(temporal: unknown): OffsetDate {
        if (temporal instanceof OffsetDate) {
            return temporal;
        }
        const input = requireNonNull(temporal, 'temporal') as TemporalAccessor;
        try {
            return new OffsetDate(LocalDate.from(input), ZoneOffset.from(input) as ZoneOffset);
        } catch (error) {
            const value = input as { readonly constructor: { readonly name: string } };
            throw new DateTimeException(
                `Unable to obtain OffsetDate from TemporalAccessor: ${value.constructor.name}`,
                error as Error,
            );
        }
    }

    static parse(text: string, formatter: DateTimeFormatter = DateTimeFormatter.ISO_OFFSET_DATE): OffsetDate {
        requireNonNull(formatter, 'formatter');
        return formatter.parse(text, type().FROM);
    }

    private constructor(date: LocalDate, offset: ZoneOffset) {
        super();
        this._date = requireNonNull(date, 'date');
        this._offset = requireNonNull(offset, 'offset');
    }

    private _with(date: LocalDate, offset: ZoneOffset): OffsetDate {
        return this._date === date && this._offset.equals(offset) ? this : new OffsetDate(date, offset);
    }

    override isSupported(fieldOrUnit: TemporalField | TemporalUnit | null): boolean {
        if (fieldOrUnit instanceof TemporalField) return this._isSupportedField(fieldOrUnit);
        if (fieldOrUnit instanceof TemporalUnit) return this._isSupportedUnit(fieldOrUnit);
        if (fieldOrUnit == null) return false;
        const value = fieldOrUnit as { readonly constructor: { readonly name: string } };
        throw new IllegalArgumentException(
            `fieldOrUnit must be an instance of TemporalField or TemporalUnit, but is ${value.constructor.name}`,
        );
    }

    protected _isSupportedField(field: TemporalField): boolean {
        return field instanceof ChronoField
            ? field.isDateBased() || field === ChronoField.OFFSET_SECONDS
            : field.isSupportedBy(this);
    }

    protected _isSupportedUnit(unit: TemporalUnit): boolean {
        return unit instanceof ChronoUnit ? unit.isDateBased() : unit.isSupportedBy(this);
    }

    override range(field: TemporalField): ValueRange {
        requireNonNull(field, 'field');
        requireInstance(field, TemporalField, 'field');
        if (field instanceof ChronoField) {
            return field === ChronoField.OFFSET_SECONDS ? field.range() : this._date.range(field);
        }
        return field.rangeRefinedBy(this);
    }

    override get(field: TemporalField): number {
        requireNonNull(field, 'field');
        requireInstance(field, TemporalField, 'field');
        return this.range(field).checkValidIntValue(this.getLong(field), field);
    }

    override getLong(field: TemporalField): number {
        requireNonNull(field, 'field');
        requireInstance(field, TemporalField, 'field');
        if (field instanceof ChronoField) {
            return field === ChronoField.OFFSET_SECONDS ? this.offset().totalSeconds() : this._date.getLong(field);
        }
        return field.getFrom(this);
    }

    offset(): ZoneOffset { return this._offset; }
    withOffsetSameLocal(offset: ZoneOffset): OffsetDate { return this._with(this._date, requireNonNull(offset, 'offset')); }
    toLocalDate(): LocalDate { return this._date; }
    year(): number { return this._date.year(); }
    monthValue(): number { return this._date.monthValue(); }
    month(): Month { return this._date.month(); }
    dayOfMonth(): number { return this._date.dayOfMonth(); }
    dayOfYear(): number { return this._date.dayOfYear(); }
    dayOfWeek(): DayOfWeek { return this._date.dayOfWeek(); }

    protected override _withAdjuster(adjuster: TemporalAdjuster): OffsetDate {
        if (adjuster instanceof LocalDate) return this._with(adjuster, this._offset);
        if (adjuster instanceof ZoneOffset) return this._with(this._date, adjuster);
        if (adjuster instanceof OffsetDate) return adjuster;
        return super._withAdjuster(adjuster) as OffsetDate;
    }

    protected override _withField(field: TemporalField, newValue: number): OffsetDate {
        requireNonNull(field, 'field');
        requireInstance(field, TemporalField, 'field');
        if (field instanceof ChronoField) {
            if (field === ChronoField.OFFSET_SECONDS) {
                return this._with(this._date, ZoneOffset.ofTotalSeconds(field.checkValidIntValue(newValue)));
            }
            return this._with(this._date.with(field, newValue), this._offset);
        }
        return field.adjustInto(this, newValue) as OffsetDate;
    }

    withYear(year: number): OffsetDate { return this._with(this._date.withYear(year), this._offset); }
    withMonth(month: number): OffsetDate { return this._with(this._date.withMonth(month), this._offset); }
    withDayOfMonth(dayOfMonth: number): OffsetDate { return this._with(this._date.withDayOfMonth(dayOfMonth), this._offset); }
    withDayOfYear(dayOfYear: number): OffsetDate { return this._with(this._date.withDayOfYear(dayOfYear), this._offset); }

    protected override _plusUnit(amountToAdd: number, unit: TemporalUnit): OffsetDate {
        if (unit instanceof ChronoUnit) return this._with(this._date.plus(amountToAdd, unit), this._offset);
        return unit.addTo(this, amountToAdd) as OffsetDate;
    }

    plusYears(years: number): OffsetDate { return this._with(this._date.plusYears(years), this._offset); }
    plusMonths(months: number): OffsetDate { return this._with(this._date.plusMonths(months), this._offset); }
    plusWeeks(weeks: number): OffsetDate { return this._with(this._date.plusWeeks(weeks), this._offset); }
    plusDays(days: number): OffsetDate { return this._with(this._date.plusDays(days), this._offset); }
    minusYears(years: number): OffsetDate { return this._with(this._date.minusYears(years), this._offset); }
    minusMonths(months: number): OffsetDate { return this._with(this._date.minusMonths(months), this._offset); }
    minusWeeks(weeks: number): OffsetDate { return this._with(this._date.minusWeeks(weeks), this._offset); }
    minusDays(days: number): OffsetDate { return this._with(this._date.minusDays(days), this._offset); }

    override query<R>(query: TemporalQuery<R>): R | null {
        requireNonNull(query, 'query');
        requireInstance(query, TemporalQuery, 'query');
        if (query === TemporalQueries.chronology()) return ISO as unknown as R;
        if (query === TemporalQueries.precision()) return ChronoUnit.DAYS as unknown as R;
        if (query === TemporalQueries.offset() || query === TemporalQueries.zone()) return this.offset() as unknown as R;
        return super.query(query);
    }

    adjustInto(temporal: Temporal): Temporal {
        return temporal
            .with(ChronoField.OFFSET_SECONDS, this.offset().totalSeconds())
            .with(ChronoField.EPOCH_DAY, this.toLocalDate().toEpochDay());
    }

    override until(endExclusive: Temporal, unit: TemporalUnit): number {
        const end = OffsetDate.from(endExclusive);
        if (unit instanceof ChronoUnit) {
            const offsetDiff = end._offset.totalSeconds() - this._offset.totalSeconds();
            return this._date.until(end._date.plusDays(MathUtil.intDiv(-offsetDiff, SECONDS_PER_DAY)), unit);
        }
        return unit.between(this, end);
    }

    format(formatter: DateTimeFormatter): string { return requireNonNull(formatter, 'formatter').format(this); }
    atTime(time: LocalTime): OffsetDateTime { return OffsetDateTime.of(this._date, time, this._offset); }

    private _toEpochSecond(): number {
        return this._date.toEpochDay() * SECONDS_PER_DAY - this._offset.totalSeconds();
    }

    toEpochSecond(time: LocalTime): number {
        return this._toEpochSecond() + requireNonNull(time, 'time').toSecondOfDay();
    }

    compareTo(other: OffsetDate): number {
        requireNonNull(other, 'other');
        requireInstance(other, OffsetDate, 'other');
        if (this._offset.equals(other._offset)) return this._date.compareTo(other._date);
        const epoch = this._toEpochSecond() - other._toEpochSecond();
        return epoch === 0 ? this._date.compareTo(other._date) : epoch;
    }

    isAfter(other: OffsetDate): boolean { requireNonNull(other, 'other'); requireInstance(other, OffsetDate, 'other'); return this._toEpochSecond() > other._toEpochSecond(); }
    isBefore(other: OffsetDate): boolean { requireNonNull(other, 'other'); requireInstance(other, OffsetDate, 'other'); return this._toEpochSecond() < other._toEpochSecond(); }
    isEqual(other: OffsetDate): boolean { requireNonNull(other, 'other'); requireInstance(other, OffsetDate, 'other'); return this._toEpochSecond() === other._toEpochSecond(); }

    equals(obj: unknown): boolean {
        return this === obj || obj instanceof OffsetDate && this._date.equals(obj._date) && this._offset.equals(obj._offset);
    }

    hashCode(): number { return this._date.hashCode() ^ this._offset.hashCode(); }
    override toString(): string { return this._date.toString() + this._offset.toString(); }
}

export function _init(): void {
    const offsetDate = type();
    offsetDate.MIN = OffsetDate.of(LocalDate.MIN, ZoneOffset.MAX);
    offsetDate.MAX = OffsetDate.of(LocalDate.MAX, ZoneOffset.MIN);
    offsetDate.FROM = createTemporalQuery('OffsetDate.FROM', (temporal) => OffsetDate.from(temporal));
}

function createTemporalQuery<R>(name: string, queryFrom: (temporal: TemporalAccessor) => R): TemporalQuery<R> {
    abstract class ExtendedTemporalQuery extends TemporalQuery<R> {}
    const Query = ExtendedTemporalQuery as unknown as QueryCtor<R>;
    Query.prototype.queryFrom = queryFrom;
    return new Query(name);
}
