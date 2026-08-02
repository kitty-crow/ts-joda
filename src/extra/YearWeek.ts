/*
 * @copyright (c) 2022, Philipp Thürwächter & Pattrick Hüper & Michał Sobkiewicz
 * @copyright (c) 2007-present, Stephen Colebourne & Michael Nascimento Santos
 * @license BSD-3-Clause (see LICENSE in the root directory of this source tree)
 */

import {
    ChronoField,
    ChronoUnit,
    Clock,
    DateTimeException,
    DateTimeFormatter,
    DateTimeFormatterBuilder,
    DayOfWeek,
    IllegalArgumentException,
    IsoChronology,
    IsoFields,
    LocalDate,
    NullPointerException,
    SignStyle,
    Temporal,
    TemporalField,
    TemporalQueries,
    TemporalQuery,
    TemporalUnit,
    UnsupportedTemporalTypeException,
    ValueRange,
    Year,
    ZoneId,
    type TemporalAccessor,
    type TemporalAdjuster,
} from '@js-joda/core';
import { assert, requireInstance, requireNonNull } from './assert.ts';
import { MathUtil } from './math.ts';

interface YearWeekStatics {
    PARSER: DateTimeFormatter;
    FROM: TemporalQuery<YearWeek>;
}

type IsoChronologyType = typeof IsoChronology & { INSTANCE: IsoChronology };
type QueryCtor<R> = new (name: string) => TemporalQuery<R>;

const ISO = (IsoChronology as IsoChronologyType).INSTANCE;

function type(): typeof YearWeek & YearWeekStatics {
    return YearWeek as typeof YearWeek & YearWeekStatics;
}

/** A year and ISO week-of-week-based-year, such as `2015-W13`. */
export class YearWeek extends Temporal {
    private readonly _year: number;
    private readonly _week: number;

    static now(): YearWeek;
    static now(zoneIdOrClock: ZoneId | Clock): YearWeek;
    static now(zoneIdOrClock?: unknown): YearWeek {
        switch (arguments.length) {
            case 0:
                return YearWeek._now0();
            case 1: {
                const input = requireNonNull(zoneIdOrClock, 'clockOrZone');
                if (input instanceof ZoneId) {
                    return YearWeek._nowZoneId(input);
                }
                if (input instanceof Clock) {
                    return YearWeek._nowClock(input);
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

    static _now0(): YearWeek {
        return YearWeek.now(Clock.systemDefaultZone());
    }

    static _nowZoneId(zone: ZoneId): YearWeek {
        return YearWeek.now(Clock.system(zone));
    }

    static _nowClock(clock: Clock): YearWeek {
        const now = LocalDate.now(clock);
        return YearWeek.of(
            now.get(IsoFields.WEEK_BASED_YEAR),
            now.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR),
        );
    }

    static of(year: Year | number, week: number): YearWeek {
        MathUtil.verifyInt(week);
        if (year instanceof Year) {
            return YearWeek._ofYearWeek(year, week);
        }
        MathUtil.verifyInt(year);
        return YearWeek._ofWeekBasedYear(year, week);
    }

    static _ofYearWeek(year: Year, week: number): YearWeek {
        return YearWeek._ofWeekBasedYear(year.value(), week);
    }

    static _ofWeekBasedYear(weekBasedYear: number, week: number): YearWeek {
        IsoFields.WEEK_BASED_YEAR.range().checkValidValue(
            weekBasedYear,
            IsoFields.WEEK_BASED_YEAR,
        );
        IsoFields.WEEK_OF_WEEK_BASED_YEAR.range().checkValidValue(
            week,
            IsoFields.WEEK_OF_WEEK_BASED_YEAR,
        );
        if (week === 53 && YearWeek._weekRange(weekBasedYear) < 53) {
            week = 1;
            weekBasedYear += 1;
            IsoFields.WEEK_BASED_YEAR.range().checkValidValue(
                weekBasedYear,
                IsoFields.WEEK_BASED_YEAR,
            );
        }
        return new YearWeek(weekBasedYear, week);
    }

    static _weekRange(weekBasedYear: number): number {
        const date = LocalDate.of(weekBasedYear, 1, 1);
        if (
            date.dayOfWeek() === DayOfWeek.THURSDAY
            || (date.dayOfWeek() === DayOfWeek.WEDNESDAY && date.isLeapYear())
        ) {
            return 53;
        }
        return 52;
    }

    static from(temporal: TemporalAccessor): YearWeek;
    static from(temporal: unknown): YearWeek {
        if (temporal instanceof YearWeek) {
            return temporal;
        }
        const input = requireNonNull(temporal, 'temporal') as TemporalAccessor;
        try {
            const year = MathUtil.safeToInt(input.getLong(IsoFields.WEEK_BASED_YEAR));
            const week = MathUtil.safeToInt(input.getLong(IsoFields.WEEK_OF_WEEK_BASED_YEAR));
            return YearWeek.of(year, week);
        } catch (error) {
            const value = input as { readonly constructor: { readonly name: string } };
            throw new DateTimeException(
                `Unable to obtain YearWeek from TemporalAccessor: ${value.constructor.name}`,
                error as Error,
            );
        }
    }

    static parse(text: string, formatter: DateTimeFormatter = type().PARSER): YearWeek {
        assert(formatter != null, 'formatter', NullPointerException);
        return formatter.parse(text, type().FROM);
    }

    private constructor(weekBasedYear: number, week: number) {
        super();
        this._year = weekBasedYear;
        this._week = week;
    }

    override isSupported(fieldOrUnit: TemporalField | TemporalUnit | null): boolean {
        if (fieldOrUnit instanceof TemporalField) {
            return this._isSupportedField(fieldOrUnit);
        }
        if (fieldOrUnit instanceof TemporalUnit) {
            return this._isSupportedUnit(fieldOrUnit);
        }
        if (fieldOrUnit == null) {
            return false;
        }
        const value = fieldOrUnit as { readonly constructor: { readonly name: string } };
        throw new IllegalArgumentException(
            `fieldOrUnit must be an instance of TemporalField or TemporalUnit, but is ${value.constructor.name}`,
        );
    }

    protected _isSupportedField(field: TemporalField): boolean {
        if (
            field === IsoFields.WEEK_OF_WEEK_BASED_YEAR
            || field === IsoFields.WEEK_BASED_YEAR
        ) {
            return true;
        }
        if (field instanceof ChronoField) {
            return false;
        }
        return field.isSupportedBy(this);
    }

    protected _isSupportedUnit(unit: TemporalUnit): boolean {
        if (unit === ChronoUnit.WEEKS || unit === IsoFields.WEEK_BASED_YEARS) {
            return true;
        }
        if (unit instanceof ChronoUnit) {
            return false;
        }
        return unit.isSupportedBy(this);
    }

    override range(field: TemporalField): ValueRange {
        requireNonNull(field, 'field');
        if (field === IsoFields.WEEK_BASED_YEAR) {
            return IsoFields.WEEK_BASED_YEAR.range();
        }
        if (field === IsoFields.WEEK_OF_WEEK_BASED_YEAR) {
            return ValueRange.of(1, YearWeek._weekRange(this._year));
        }
        return super.range(field);
    }

    override get(field: TemporalField): number {
        return this.range(field).checkValidIntValue(this.getLong(field), field);
    }

    override getLong(field: TemporalField): number {
        requireNonNull(field, 'field');
        if (field === IsoFields.WEEK_BASED_YEAR) {
            return this._year;
        }
        if (field === IsoFields.WEEK_OF_WEEK_BASED_YEAR) {
            return this._week;
        }
        if (field instanceof ChronoField) {
            throw new UnsupportedTemporalTypeException(`Unsupported field: ${field}`);
        }
        return field.getFrom(this);
    }

    year(): number {
        return this._year;
    }

    week(): number {
        return this._week;
    }

    is53WeekYear(): boolean {
        return YearWeek._weekRange(this._year) === 53;
    }

    lengthOfYear(): number {
        return this.is53WeekYear() ? 371 : 364;
    }

    override _withAdjuster(adjuster: TemporalAdjuster): YearWeek {
        if (adjuster instanceof YearWeek) {
            return adjuster;
        }
        return super._withAdjuster(adjuster) as YearWeek;
    }

    override _withField(field: TemporalField, newValue: number): YearWeek {
        if (field === IsoFields.WEEK_OF_WEEK_BASED_YEAR) {
            return this.withWeek(
                IsoFields.WEEK_OF_WEEK_BASED_YEAR.range().checkValidIntValue(
                    newValue,
                    IsoFields.WEEK_OF_WEEK_BASED_YEAR,
                ),
            );
        }
        if (field === IsoFields.WEEK_BASED_YEAR) {
            return this.withYear(
                IsoFields.WEEK_BASED_YEAR.range().checkValidIntValue(
                    newValue,
                    IsoFields.WEEK_BASED_YEAR,
                ),
            );
        }
        if (field instanceof ChronoField) {
            throw new UnsupportedTemporalTypeException(`Unsupported field: ${field}`);
        }
        return field.adjustInto(this, newValue) as YearWeek;
    }

    withYear(weekBasedYear: number): YearWeek {
        if (this._week === 53 && YearWeek._weekRange(weekBasedYear) < 53) {
            return YearWeek.of(weekBasedYear, 52);
        }
        return YearWeek.of(weekBasedYear, this._week);
    }

    withWeek(week: number): YearWeek {
        return YearWeek.of(this._year, week);
    }

    override _plusUnit(amountToAdd: number, unit: TemporalUnit): YearWeek {
        if (unit === ChronoUnit.WEEKS) {
            return this.plusWeeks(amountToAdd);
        }
        if (unit === IsoFields.WEEK_BASED_YEARS) {
            return this.plusYears(amountToAdd);
        }
        if (unit instanceof ChronoUnit) {
            throw new UnsupportedTemporalTypeException(`Unsupported unit: ${unit}`);
        }
        return unit.addTo(this, amountToAdd) as YearWeek;
    }

    plusYears(yearsToAdd: number): YearWeek {
        if (yearsToAdd === 0) {
            return this;
        }
        return this.withYear(
            MathUtil.safeToInt(MathUtil.safeAdd(this._year, yearsToAdd)),
        );
    }

    plusWeeks(weeksToAdd: number): YearWeek {
        if (weeksToAdd === 0) {
            return this;
        }
        return YearWeek.from(this.atDay(DayOfWeek.MONDAY).plusWeeks(weeksToAdd));
    }

    override _minusUnit(amountToSubtract: number, unit: TemporalUnit): YearWeek {
        requireNonNull(amountToSubtract, 'amountToSubtract');
        requireNonNull(unit, 'unit');
        return this._plusUnit(-amountToSubtract, unit);
    }

    minusYears(yearsToSubtract: number): YearWeek {
        if (yearsToSubtract === 0) {
            return this;
        }
        return this.withYear(
            MathUtil.safeToInt(MathUtil.safeSubtract(this._year, yearsToSubtract)),
        );
    }

    minusWeeks(weeksToSubtract: number): YearWeek {
        if (weeksToSubtract === 0) {
            return this;
        }
        return YearWeek.from(this.atDay(DayOfWeek.MONDAY).minusWeeks(weeksToSubtract));
    }

    override query<R>(query: TemporalQuery<R>): R | null {
        requireNonNull(query, 'query');
        requireInstance(query, TemporalQuery, 'query');
        if (query === TemporalQueries.chronology()) {
            return ISO as unknown as R;
        }
        return super.query(query);
    }

    adjustInto<T extends Temporal>(temporal: T): T {
        return temporal
            .with(IsoFields.WEEK_BASED_YEAR, this._year)
            .with(IsoFields.WEEK_OF_WEEK_BASED_YEAR, this._week);
    }

    override until(endExclusive: Temporal, unit: TemporalUnit): number {
        const end = YearWeek.from(endExclusive);
        if (unit === ChronoUnit.WEEKS) {
            return this._daysUntil(end);
        }
        if (unit === IsoFields.WEEK_BASED_YEARS) {
            return this._yearsUntil(end);
        }
        if (unit instanceof ChronoUnit) {
            throw new UnsupportedTemporalTypeException(`Unsupported unit: ${unit}`);
        }
        return unit.between(this, end);
    }

    private _daysUntil(end: YearWeek): number {
        const startDate = this.atDay(DayOfWeek.MONDAY);
        const endDate = end.atDay(DayOfWeek.MONDAY);
        return MathUtil.intDiv(endDate.toEpochDay() - startDate.toEpochDay(), 7);
    }

    private _yearsUntil(end: YearWeek): number {
        const yearsDiff = end._year - this._year;
        if (yearsDiff > 0 && end._week < this._week) {
            return yearsDiff - 1;
        }
        if (yearsDiff < 0 && end._week > this._week) {
            return yearsDiff + 1;
        }
        return yearsDiff;
    }

    format(formatter: DateTimeFormatter): string {
        requireNonNull(formatter, 'formatter');
        return formatter.format(this);
    }

    atDay(dayOfWeek: DayOfWeek): LocalDate {
        requireNonNull(dayOfWeek, 'dayOfWeek');
        const correction = LocalDate.of(this._year, 1, 4).dayOfWeek().value() + 3;
        const dayOfYear = this._week * 7 + dayOfWeek.value() - correction;
        const maxDaysOfYear = Year.isLeap(this._year) ? 366 : 365;
        if (dayOfYear > maxDaysOfYear) {
            return LocalDate.ofYearDay(this._year + 1, dayOfYear - maxDaysOfYear);
        }
        if (dayOfYear > 0) {
            return LocalDate.ofYearDay(this._year, dayOfYear);
        }
        const previousYearDays = Year.isLeap(this._year - 1) ? 366 : 365;
        return LocalDate.ofYearDay(this._year - 1, previousYearDays + dayOfYear);
    }

    compareTo(other: YearWeek): number {
        requireNonNull(other, 'other');
        requireInstance(other, YearWeek, 'other');
        const year = this._year - other._year;
        return year === 0 ? this._week - other._week : year;
    }

    isAfter(other: YearWeek): boolean {
        return this.compareTo(other) > 0;
    }

    isBefore(other: YearWeek): boolean {
        return this.compareTo(other) < 0;
    }

    equals(obj: unknown): boolean {
        if (this === obj) {
            return true;
        }
        return obj instanceof YearWeek
            && this._year === obj._year
            && this._week === obj._week;
    }

    hashCode(): number {
        return this._year ^ (this._week << 25);
    }

    override toString(): string {
        let yearString: string;
        const absYear = Math.abs(this._year);
        if (absYear < 1000) {
            yearString = this._year < 0
                ? `-${`${this._year - 10000}`.slice(-4)}`
                : `${this._year + 10000}`.slice(-4);
        } else if (this._year > 9999) {
            yearString = `+${this._year}`;
        } else {
            yearString = `${this._year}`;
        }
        return yearString.concat(this._week < 10 ? '-W0' : '-W').concat(`${this._week}`);
    }
}

export function _init(): void {
    const yearWeek = type();
    yearWeek.PARSER = new DateTimeFormatterBuilder()
        .parseCaseInsensitive()
        .appendValue(IsoFields.WEEK_BASED_YEAR, 4, 10, SignStyle.EXCEEDS_PAD)
        .appendLiteral('-W')
        .appendValue(IsoFields.WEEK_OF_WEEK_BASED_YEAR, 2)
        .toFormatter();
    yearWeek.FROM = createTemporalQuery('YearWeek.FROM', (temporal) => YearWeek.from(temporal));
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
