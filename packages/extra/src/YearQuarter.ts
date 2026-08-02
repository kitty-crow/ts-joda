/*
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
    DateTimeFormatterBuilder,
    IllegalArgumentException,
    IsoChronology,
    IsoFields,
    LocalDate,
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
import { Quarter } from './Quarter';
import { requireInstance, requireNonNull } from './assert';
import { MathUtil } from './math';

interface YearQuarterStatics {
    PARSER: DateTimeFormatter;
    FROM: TemporalQuery<YearQuarter>;
}

type IsoChronologyType = typeof IsoChronology & { INSTANCE: IsoChronology };
type QueryCtor<R> = new (name: string) => TemporalQuery<R>;

const ISO = (IsoChronology as IsoChronologyType).INSTANCE;

function type(): typeof YearQuarter & YearQuarterStatics {
    return YearQuarter as typeof YearQuarter & YearQuarterStatics;
}

function className(value: unknown): string {
    return (value as { readonly constructor: { readonly name: string } }).constructor.name;
}

/** A year and quarter-of-year, such as `2007-Q2`. */
export class YearQuarter extends Temporal {
    private readonly _year: number;
    private readonly _quarter: Quarter;

    static now(): YearQuarter;
    static now(zoneIdOrClock: ZoneId | Clock): YearQuarter;
    static now(zoneIdOrClock?: unknown): YearQuarter {
        if (arguments.length === 0) {
            return YearQuarter._now0();
        }
        if (arguments.length === 1 && zoneIdOrClock instanceof ZoneId) {
            return YearQuarter._nowZoneId(zoneIdOrClock);
        }
        return YearQuarter._nowClock(zoneIdOrClock);
    }

    static _now0(): YearQuarter {
        return YearQuarter.now(Clock.systemDefaultZone());
    }

    static _nowZoneId(zone: ZoneId): YearQuarter {
        return YearQuarter.now(Clock.system(zone));
    }

    static _nowClock(clock: unknown): YearQuarter {
        const now = LocalDate.now(clock as Clock);
        return YearQuarter.of(now.year(), Quarter.from(now.month()));
    }

    static of(year: Year | number, quarter: Quarter | number): YearQuarter;
    static of(year: unknown, quarter: unknown): YearQuarter {
        if (year instanceof Year && quarter instanceof Quarter) {
            return YearQuarter._ofYearQuarter(year, quarter);
        }
        if (year instanceof Year && typeof quarter === 'number') {
            return YearQuarter._ofYearInt(year, quarter);
        }
        if (typeof year === 'number' && quarter instanceof Quarter) {
            return YearQuarter._ofIntQuarter(year, quarter);
        }
        if (typeof year === 'number' && typeof quarter === 'number') {
            return YearQuarter._ofIntInt(year, quarter);
        }
        const yearMessage = `year must be an instance of Year or number but is ${className(year)}`;
        const quarterMessage = `quarter must be an instance of Quarter or number but is ${className(quarter)}`;
        throw new IllegalArgumentException(`${yearMessage} and ${quarterMessage}`);
    }

    static _ofYearQuarter(year: Year, quarter: Quarter): YearQuarter {
        return YearQuarter.of(year.value(), quarter);
    }

    static _ofYearInt(year: Year, quarter: number): YearQuarter {
        return YearQuarter.of(year.value(), Quarter.of(quarter));
    }

    static _ofIntQuarter(year: number, quarter: Quarter): YearQuarter {
        ChronoField.YEAR.checkValidValue(year);
        requireNonNull(quarter, 'quarter');
        return new YearQuarter(year, quarter);
    }

    static _ofIntInt(year: number, quarter: number): YearQuarter {
        ChronoField.YEAR.checkValidValue(year);
        return new YearQuarter(year, Quarter.of(quarter));
    }

    static from(temporal: TemporalAccessor): YearQuarter;
    static from(temporal: unknown): YearQuarter {
        if (temporal instanceof YearQuarter) {
            return temporal;
        }
        const input = requireNonNull(temporal, 'temporal') as TemporalAccessor;
        try {
            const year = MathUtil.safeToInt(input.getLong(ChronoField.YEAR));
            const quarter = MathUtil.safeToInt(input.getLong(IsoFields.QUARTER_OF_YEAR));
            return YearQuarter.of(year, quarter);
        } catch (error) {
            throw new DateTimeException(
                `Unable to obtain YearQuarter from TemporalAccessor: ${input} of type ${className(input)}`,
                error as Error,
            );
        }
    }

    static parse(text: string, formatter: DateTimeFormatter = type().PARSER): YearQuarter {
        requireNonNull(formatter, 'formatter');
        requireInstance(formatter, DateTimeFormatter, 'formatter');
        return formatter.parse(text, type().FROM);
    }

    private constructor(year: number, quarter: Quarter) {
        super();
        this._year = MathUtil.safeToInt(year);
        this._quarter = requireInstance(quarter, Quarter, 'Quarter');
    }

    private _with(year: number, quarter: Quarter): YearQuarter {
        if (this._year === year && this._quarter === quarter) {
            return this;
        }
        return new YearQuarter(year, quarter);
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
        throw new IllegalArgumentException(
            `fieldOrUnit must be an instance of TemporalField or TemporalUnit, but is ${className(fieldOrUnit)}`,
        );
    }

    protected _isSupportedField(field: TemporalField): boolean {
        if (field === IsoFields.QUARTER_OF_YEAR) {
            return true;
        }
        if (field instanceof ChronoField) {
            return field === ChronoField.YEAR
                || field === ChronoField.YEAR_OF_ERA
                || field === ChronoField.ERA;
        }
        return field != null && field.isSupportedBy(this);
    }

    protected _isSupportedUnit(unit: TemporalUnit): boolean {
        if (unit === IsoFields.QUARTER_YEARS) {
            return true;
        }
        if (unit instanceof ChronoUnit) {
            return unit === ChronoUnit.YEARS
                || unit === ChronoUnit.DECADES
                || unit === ChronoUnit.CENTURIES
                || unit === ChronoUnit.MILLENNIA
                || unit === ChronoUnit.ERAS;
        }
        return unit != null && unit.isSupportedBy(this);
    }

    override range(field: TemporalField): ValueRange {
        requireNonNull(field, 'field');
        requireInstance(field, TemporalField, 'field');
        if (field === IsoFields.QUARTER_OF_YEAR) {
            return IsoFields.QUARTER_OF_YEAR.range();
        }
        if (field === ChronoField.YEAR_OF_ERA) {
            return this.year() <= 0
                ? ValueRange.of(1, Year.MAX_VALUE + 1)
                : ValueRange.of(1, Year.MAX_VALUE);
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
        requireInstance(field, TemporalField, 'field');
        if (field === IsoFields.QUARTER_OF_YEAR) {
            return this._quarter.value();
        }
        if (field instanceof ChronoField) {
            switch (field) {
                case ChronoField.YEAR_OF_ERA:
                    return this._year < 1 ? 1 - this._year : this._year;
                case ChronoField.YEAR:
                    return this._year;
                case ChronoField.ERA:
                    return this._year < 1 ? 0 : 1;
                default:
                    throw new UnsupportedTemporalTypeException(`Unsupported field: ${field}`);
            }
        }
        return super.get(field);
    }

    private _prolepticQuarter(): number {
        return this._year * 4 + this._quarter.value() - 1;
    }

    year(): number {
        return this._year;
    }

    quarterValue(): number {
        return this._quarter.value();
    }

    quarter(): Quarter {
        return this._quarter;
    }

    isLeapYear(): boolean {
        return IsoChronology.isLeapYear(this._year);
    }

    isValidDay(dayOfQuarter: number): boolean {
        return dayOfQuarter >= 1 && dayOfQuarter <= this.lengthOfQuarter();
    }

    lengthOfQuarter(): number {
        return this._quarter.length(this.isLeapYear());
    }

    lengthOfYear(): number {
        return this.isLeapYear() ? 366 : 365;
    }

    protected override _withAdjuster(adjuster: TemporalAdjuster): YearQuarter {
        if (adjuster instanceof YearQuarter) {
            return adjuster;
        }
        return super._withAdjuster(adjuster) as YearQuarter;
    }

    protected override _withField(field: TemporalField, newValue: number): YearQuarter {
        requireNonNull(field, 'field');
        requireInstance(field, TemporalField, 'field');
        if (field === IsoFields.QUARTER_OF_YEAR) {
            return this.withQuarter(
                IsoFields.QUARTER_OF_YEAR.range().checkValidIntValue(
                    newValue,
                    IsoFields.QUARTER_OF_YEAR,
                ),
            );
        }
        if (field instanceof ChronoField) {
            field.checkValidValue(newValue);
            switch (field) {
                case ChronoField.YEAR_OF_ERA:
                    return this.withYear(this._year < 1 ? 1 - newValue : newValue);
                case ChronoField.YEAR:
                    return this.withYear(newValue);
                case ChronoField.ERA:
                    return this.getLong(ChronoField.ERA) === newValue
                        ? this
                        : this.withYear(1 - this._year);
                default:
                    throw new UnsupportedTemporalTypeException(`Unsupported field: ${field}`);
            }
        }
        return field.adjustInto(this, newValue) as YearQuarter;
    }

    withYear(year: number): YearQuarter {
        ChronoField.YEAR.checkValidValue(year);
        return this._with(year, this._quarter);
    }

    withQuarter(quarter: number): YearQuarter {
        IsoFields.QUARTER_OF_YEAR.range().checkValidValue(
            quarter,
            IsoFields.QUARTER_OF_YEAR,
        );
        return this._with(this._year, Quarter.of(quarter));
    }

    protected override _plusUnit(amountToAdd: number, unit: TemporalUnit): YearQuarter {
        if (unit === IsoFields.QUARTER_YEARS) {
            return this.plusQuarters(amountToAdd);
        }
        if (unit instanceof ChronoUnit) {
            switch (unit) {
                case ChronoUnit.YEARS:
                    return this.plusYears(amountToAdd);
                case ChronoUnit.DECADES:
                    return this.plusYears(MathUtil.safeMultiply(amountToAdd, 10));
                case ChronoUnit.CENTURIES:
                    return this.plusYears(MathUtil.safeMultiply(amountToAdd, 100));
                case ChronoUnit.MILLENNIA:
                    return this.plusYears(MathUtil.safeMultiply(amountToAdd, 1000));
                case ChronoUnit.ERAS:
                    return this.with(
                        ChronoField.ERA,
                        MathUtil.safeAdd(this.getLong(ChronoField.ERA), amountToAdd),
                    ) as YearQuarter;
                default:
                    throw new UnsupportedTemporalTypeException(`Unsupported unit: ${unit}`);
            }
        }
        return unit.addTo(this, amountToAdd) as YearQuarter;
    }

    plusYears(yearsToAdd: number): YearQuarter {
        if (yearsToAdd === 0) {
            return this;
        }
        const year = ChronoField.YEAR.checkValidIntValue(this._year + yearsToAdd);
        return this._with(year, this._quarter);
    }

    plusQuarters(quartersToAdd: number): YearQuarter {
        if (quartersToAdd === 0) {
            return this;
        }
        const quarterCount = this._year * 4 + this._quarter.value() - 1;
        const quarters = quarterCount + quartersToAdd;
        const year = ChronoField.YEAR.checkValidIntValue(MathUtil.intDiv(quarters, 4));
        const quarter = MathUtil.floorMod(quarters, 4) + 1;
        return this._with(year, Quarter.of(quarter));
    }

    minusYears(yearsToSubtract: number): YearQuarter {
        const min = MathUtil.MIN_SAFE_INTEGER;
        if (min !== undefined && yearsToSubtract === min) {
            return this.plusYears(min).plusYears(1);
        }
        return this.plusYears(-yearsToSubtract);
    }

    minusQuarters(quartersToSubtract: number): YearQuarter {
        const min = MathUtil.MIN_SAFE_INTEGER;
        if (min !== undefined && quartersToSubtract === min) {
            return this.plusQuarters(min).plusQuarters(1);
        }
        return this.plusQuarters(-quartersToSubtract);
    }

    override query<R>(query: TemporalQuery<R>): R | null {
        if (query === TemporalQueries.chronology()) {
            return ISO as unknown as R;
        }
        if (query === TemporalQueries.precision()) {
            return IsoFields.QUARTER_YEARS as unknown as R;
        }
        return super.query(query);
    }

    adjustInto(temporal: Temporal): Temporal {
        const old = temporal.get(ChronoField.YEAR) * 4
            + temporal.get(IsoFields.QUARTER_OF_YEAR) - 1;
        return temporal.plus(this._prolepticQuarter() - old, IsoFields.QUARTER_YEARS);
    }

    override until(endExclusive: Temporal, unit: TemporalUnit): number {
        requireNonNull(endExclusive, 'endExclusive');
        requireNonNull(unit, 'unit');
        requireInstance(endExclusive, Temporal, 'endExclusive');
        requireInstance(unit, TemporalUnit, 'unit');
        const end = YearQuarter.from(endExclusive);
        const quarters = end._prolepticQuarter() - this._prolepticQuarter();
        if (unit === IsoFields.QUARTER_YEARS) {
            return quarters;
        }
        if (unit instanceof ChronoUnit) {
            switch (unit) {
                case ChronoUnit.YEARS:
                    return MathUtil.intDiv(quarters, 4);
                case ChronoUnit.DECADES:
                    return MathUtil.intDiv(quarters, 40);
                case ChronoUnit.CENTURIES:
                    return MathUtil.intDiv(quarters, 400);
                case ChronoUnit.MILLENNIA:
                    return MathUtil.intDiv(quarters, 4000);
                case ChronoUnit.ERAS:
                    return end.getLong(ChronoField.ERA) - this.getLong(ChronoField.ERA);
                default:
                    throw new UnsupportedTemporalTypeException(`Unsupported unit: ${unit}`);
            }
        }
        return unit.between(this, end);
    }

    format(formatter: DateTimeFormatter): string {
        return requireNonNull(formatter, 'formatter').format(this);
    }

    atDay(dayOfQuarter: number): LocalDate {
        ValueRange.of(1, this.lengthOfQuarter()).checkValidValue(
            dayOfQuarter,
            IsoFields.DAY_OF_QUARTER,
        );
        const leap = Year.isLeap(this._year);
        let month = this._quarter.firstMonth();
        while (dayOfQuarter > month.length(leap)) {
            dayOfQuarter -= month.length(leap);
            month = month.plus(1);
        }
        return LocalDate.of(this._year, month, dayOfQuarter);
    }

    atEndOfQuarter(): LocalDate {
        const month = this._quarter.firstMonth().plus(2);
        return LocalDate.of(this._year, month, month.maxLength());
    }

    compareTo(other: YearQuarter): number {
        requireNonNull(other, 'other');
        requireInstance(other, YearQuarter, 'other');
        const year = this._year - other._year;
        return year === 0 ? this._quarter.compareTo(other._quarter) : year;
    }

    isAfter(other: YearQuarter): boolean {
        return this.compareTo(other) > 0;
    }

    isBefore(other: YearQuarter): boolean {
        return this.compareTo(other) < 0;
    }

    equals(obj: unknown): boolean {
        return this === obj
            || obj instanceof YearQuarter
                && this._year === obj._year
                && this._quarter === obj._quarter;
    }

    hashCode(): number {
        return this._year ^ (this._quarter.value() << 27);
    }

    override toString(): string {
        const absYear = Math.abs(this._year);
        let year: string;
        if (absYear < 1000) {
            year = this._year < 0
                ? `-${`${this._year - 10000}`.slice(-4)}`
                : `${this._year + 10000}`.slice(-4);
        } else {
            year = this._year > 9999 ? `+${this._year}` : `${this._year}`;
        }
        return year.concat('-').concat(this._quarter.toString());
    }
}

export function _init(): void {
    const yearQuarter = type();
    yearQuarter.PARSER = new DateTimeFormatterBuilder()
        .parseCaseInsensitive()
        .appendValue(ChronoField.YEAR, 4, 10, SignStyle.EXCEEDS_PAD)
        .appendLiteral('-')
        .appendLiteral('Q')
        .appendValue(IsoFields.QUARTER_OF_YEAR, 1)
        .toFormatter();
    yearQuarter.FROM = createTemporalQuery(
        'YearQuarter.FROM',
        (temporal) => YearQuarter.from(temporal),
    );
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
