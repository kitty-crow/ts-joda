import type { DayOfWeek } from "./DayOfWeek.ts";
import type { Month } from "./Month.ts";
import type { TemporalAccessor } from "./temporal/TemporalAccessor.ts";
import type { TemporalAdjuster } from "./temporal/TemporalAdjuster.ts";
import type { TemporalAmount } from "./temporal/TemporalAmount.ts";
import type { TemporalField } from "./temporal/TemporalField.ts";
import type { TemporalQuery } from "./temporal/TemporalQuery.ts";
import type { TemporalUnit } from "./temporal/TemporalUnit.ts";
/**
 * @copyright (c) 2016-present, Philipp Thürwächter & Pattrick Hüper  & js-joda contributors
 * @copyright (c) 2007-present, Stephen Colebourne & Michael Nascimento Santos
 * @license BSD-3-Clause (see LICENSE in the root directory of this source tree)
 */
import { ChronoField } from "./temporal/ChronoField.ts";
import { ChronoUnit } from "./temporal/ChronoUnit.ts";
import { Temporal } from "./temporal/Temporal.ts";
import { Clock } from "./Clock.ts";
import { DateTimeFormatter } from "./format/DateTimeFormatter.ts";
import { Instant } from "./Instant.ts";
import { IsoChronology } from "./chrono/IsoChronology.ts";
import { LocalDateTime } from "./LocalDateTime.ts";
import { LocalDate } from "./LocalDate.ts";
import { LocalTime } from "./LocalTime.ts";
import { MathUtil } from "./MathUtil.ts";
import { OffsetTime } from "./OffsetTime.ts";
import { TemporalQueries } from "./temporal/TemporalQueries.ts";
import { ZonedDateTime } from "./ZonedDateTime.ts";
import { ZoneId } from "./ZoneId.ts";
import { ZoneOffset } from "./ZoneOffset.ts";
import { DateTimeException, IllegalArgumentException } from "./errors.ts";
import { createTemporalQuery } from "./temporal/TemporalQuery.ts";
import { requireInstance, requireNonNull } from "./assert.ts";
/**
 * A date-time with an offset from UTC/Greenwich in the ISO-8601 calendar system,
 * such as 2007-12-23T10:15:30+01:00.
 */
export class OffsetDateTime extends Temporal {
    static MIN: OffsetDateTime;
    static MAX: OffsetDateTime;
    static FROM: TemporalQuery<OffsetDateTime>;
    _dateTime!: LocalDateTime;
    _offset!: ZoneOffset;
    /**
     * @param {TemporaroAccessor} temporal
     * @return {OffsetDateTime}
     */
    static from(temporal: TemporalAccessor): OffsetDateTime {
        requireNonNull(temporal, 'temporal');
        if (temporal instanceof OffsetDateTime) {
            return temporal;
        }
        try {
            const offset = ZoneOffset.from(temporal);
            try {
                const ldt = LocalDateTime.from(temporal);
                return OffsetDateTime.of(ldt, offset);
            }
            catch (_) {
                const instant = Instant.from(temporal);
                return OffsetDateTime.ofInstant(instant, offset);
            }
        }
        catch (ex) {
            throw new DateTimeException(`Unable to obtain OffsetDateTime TemporalAccessor: ${temporal}, type ${temporal.constructor != null ? temporal.constructor.name : ''}`);
        }
    }
    /**
     * @param {Clock|ZoneId|null} clockOrZone
     * @return {OffsetDateTime}
     */
    static now(clockOrZone?: Clock | ZoneId): OffsetDateTime {
        if (arguments.length === 0) {
            return OffsetDateTime.now(Clock.systemDefaultZone());
        }
        else {
            requireNonNull(clockOrZone, 'clockOrZone');
            if (clockOrZone instanceof ZoneId) {
                return OffsetDateTime.now(Clock.system(clockOrZone));
            }
            else if (clockOrZone instanceof Clock) {
                const now = clockOrZone.instant(); // called once
                return OffsetDateTime.ofInstant(now, clockOrZone.zone().rules().offset(now));
            }
            else {
                throw new IllegalArgumentException('clockOrZone must be an instance of ZoneId or Clock');
            }
        }
    }    static of(dateTime: LocalDateTime, offset: ZoneOffset): OffsetDateTime;
    static of(date: LocalDate, time: LocalTime, offset: ZoneOffset): OffsetDateTime;
    static of(year: number, month: number, day: number, hour: number, minute: number, second: number, nanoOfSecond: number, offset: ZoneOffset): OffsetDateTime;

    /**
     * @return {OffsetDateTime}
     */
    static of(dateTimeOrYear: LocalDateTime | LocalDate | number, offsetOrTimeOrMonth: ZoneOffset | LocalTime | number, offsetOrDay?: ZoneOffset | number, hour?: number, minute?: number, second?: number, nanoOfSecond?: number, finalOffset?: ZoneOffset): OffsetDateTime {
        if (dateTimeOrYear instanceof LocalDateTime && offsetOrTimeOrMonth instanceof ZoneOffset) {
            return OffsetDateTime.ofDateTime(dateTimeOrYear, offsetOrTimeOrMonth);
        }
        if (dateTimeOrYear instanceof LocalDate && offsetOrTimeOrMonth instanceof LocalTime && offsetOrDay instanceof ZoneOffset) {
            return OffsetDateTime.ofDateAndTime(dateTimeOrYear, offsetOrTimeOrMonth, offsetOrDay);
        }
        return OffsetDateTime.ofNumbers(
            dateTimeOrYear as number,
            offsetOrTimeOrMonth as number,
            requireNonNull(offsetOrDay as number | undefined, 'dayOfMonth'),
            requireNonNull(hour, 'hour'),
            requireNonNull(minute, 'minute'),
            requireNonNull(second, 'second'),
            requireNonNull(nanoOfSecond, 'nanoOfSecond'),
            requireNonNull(finalOffset, 'offset'),
        );
    }
    static ofDateTime(dateTime: LocalDateTime, offset: ZoneOffset): OffsetDateTime {
        return new OffsetDateTime(dateTime, offset);
    }
    static ofDateAndTime(date: LocalDate, time: LocalTime, offset: ZoneOffset): OffsetDateTime {
        const dt = LocalDateTime.of(date, time);
        return new OffsetDateTime(dt, offset);
    }
    static ofNumbers(year: number, month: number, dayOfMonth: number, hour: number, minute: number, second: number, nanoOfSecond: number, offset: ZoneOffset): OffsetDateTime {
        const dt = LocalDateTime.of(year, month, dayOfMonth, hour, minute, second, nanoOfSecond);
        return new OffsetDateTime(dt, offset);
    }
    /**
     * @param {Instant} instant
     * @param {ZoneId} zone
     * @return {OffsetDateTime}
     */
    static ofInstant(instant: Instant, zone: ZoneId): OffsetDateTime {
        requireNonNull(instant, 'instant');
        requireNonNull(zone, 'zone');
        const rules = zone.rules();
        const offset = rules.offset(instant);
        const ldt = LocalDateTime.ofEpochSecond(instant.epochSecond(), instant.nano(), offset);
        return new OffsetDateTime(ldt, offset);
    }
    /**
     * @param {string} text
     * @param {DateTimeFormatter|undefined} formatter
     * @return {OffsetTime}
     */
    static parse(text: string, formatter: DateTimeFormatter  = DateTimeFormatter.ISO_OFFSET_DATE_TIME): OffsetDateTime {
        requireNonNull(formatter, 'formatter');
        return formatter.parse(text, OffsetDateTime.FROM);
    }
    // TODO: Need java.util.Comparater interface.
    // static timeLineOrder() {
    //
    // }
    //-----------------------------------------------------------------------
    /**
     * @param {LocalDateTime} dateTime
     * @param {ZoneOffset} offset
     * @private
     */
    constructor(dateTime: LocalDateTime, offset: ZoneOffset) {
        super();
        requireNonNull(dateTime, 'dateTime');
        requireInstance(dateTime, LocalDateTime, 'dateTime');
        requireNonNull(offset, 'offset');
        requireInstance(offset, ZoneOffset, 'offset');
        this._dateTime = dateTime;
        this._offset = offset;
    }
    /**
     *
     * @param {Temporal} temporal
     * @return {Temporal}
     */
    adjustInto<T extends Temporal>(temporal: T): T {
        return temporal
            .with(ChronoField.EPOCH_DAY, this.toLocalDate().toEpochDay())
            .with(ChronoField.NANO_OF_DAY, this.toLocalTime().toNanoOfDay())
            .with(ChronoField.OFFSET_SECONDS, this.offset().totalSeconds()) as T;
    }
    until(endExclusive: Temporal, unit: TemporalUnit): number {
        let end = OffsetDateTime.from(endExclusive);
        if (unit instanceof ChronoUnit) {
            end = end.withOffsetSameInstant(this._offset);
            return this._dateTime.until(end._dateTime, unit);
        }
        return unit.between(this, end);
    }
    /**
     * @param {ZoneId} zone
     * @return {ZonedDateTime}
     */
    atZoneSameInstant(zone: ZoneId): ZonedDateTime {
        return ZonedDateTime.ofInstant(this._dateTime, this._offset, zone);
    }
    /**
     * @param {ZoneId} zone
     * @return {ZonedDateTime}
     */
    atZoneSimilarLocal(zone: ZoneId): ZonedDateTime {
        return ZonedDateTime.ofLocal(this._dateTime, zone, this._offset);
    }
    query<R>(query: TemporalQuery<R>): R | null {
        requireNonNull(query, 'query');
        if (query === TemporalQueries.chronology()) {
            return IsoChronology.INSTANCE as unknown as R;
        }
        else if (query === TemporalQueries.precision()) {
            return ChronoUnit.NANOS as unknown as R;
        }
        else if (query === TemporalQueries.offset() || query === TemporalQueries.zone()) {
            return this.offset() as unknown as R;
        }
        else if (query === TemporalQueries.localDate()) {
            return this.toLocalDate() as unknown as R;
        }
        else if (query === TemporalQueries.localTime()) {
            return this.toLocalTime() as unknown as R;
        }
        else if (query === TemporalQueries.zoneId()) {
            return null;
        }
        return super.query(query);
    }
    override get(field: TemporalField): number {
        if (field instanceof ChronoField) {
            switch (field) {
                case ChronoField.INSTANT_SECONDS: throw new DateTimeException(`Field too large for an int: ${field}`);
                case ChronoField.OFFSET_SECONDS: return this.offset().totalSeconds();
            }
            return this._dateTime.get(field);
        }
        return super.get(field);
    }
    getLong(field: TemporalField): number {
        if (field instanceof ChronoField) {
            switch (field) {
                case ChronoField.INSTANT_SECONDS: return this.toEpochSecond();
                case ChronoField.OFFSET_SECONDS: return this.offset().totalSeconds();
            }
            return this._dateTime.getLong(field);
        }
        return field.getFrom(this);
    }
    /**
     * @return {ZoneOffset}
     */
    offset(): ZoneOffset {
        return this._offset;
    }
    /**
     * @return {number} the year, from MIN_YEAR to MAX_YEAR
     */
    year(): number {
        return this._dateTime.year();
    }
    /**
     * @return {number} the month-of-year, from 1 to 12
     * @see #month()
     */
    monthValue(): number {
        return this._dateTime.monthValue();
    }
    /**
     * @return {{number} }the month-of-year, not null
     * @see #monthValue()
     */
    month(): Month {
        return this._dateTime.month();
    }
    /**
     * @return {number} the day-of-month, from 1 to 31
     */
    dayOfMonth(): number {
        return this._dateTime.dayOfMonth();
    }
    /**
     * @return {number} the day-of-year, from 1 to 365, or 366 in a leap year
     */
    dayOfYear(): number {
        return this._dateTime.dayOfYear();
    }
    /**
     * @return {number} the day-of-week, not null
     */
    dayOfWeek(): DayOfWeek {
        return this._dateTime.dayOfWeek();
    }
    /**
     * @return {number} the hour-of-day, from 0 to 23
     */
    hour(): number {
        return this._dateTime.hour();
    }
    /**
     * @return {number} the minute-of-hour, from 0 to 59
     */
    minute(): number {
        return this._dateTime.minute();
    }
    /**
     * @return {number} the second-of-minute, from 0 to 59
     */
    second(): number {
        return this._dateTime.second();
    }
    /**
     * @return {number} the nano-of-second, from 0 to 999,999,999
     */
    nano(): number {
        return this._dateTime.nano();
    }
    //-----------------------------------------------------------------------
    /**
     * @return {LocalDateTime}the local date-time part of this date-time, not null
     */
    toLocalDateTime(): LocalDateTime {
        return this._dateTime;
    }
    /**
     * @return {LocalDate} the date part of this date-time, not null
     */
    toLocalDate(): LocalDate {
        return this._dateTime.toLocalDate();
    }
    /**
     * @return {LocalTime} the time part of this date-time, not null
     */
    toLocalTime(): LocalTime {
        return this._dateTime.toLocalTime();
    }
    /**
     * @return {OffsetTime} an OffsetTime representing the time and offset, not null
     */
    toOffsetTime(): OffsetTime {
        return OffsetTime.of(this._dateTime.toLocalTime(), this._offset);
    }
    /**
     * @return {ZonedDateTime}a zoned date-time representing the same local date-time and offset, not null
     */
    toZonedDateTime(): ZonedDateTime {
        return ZonedDateTime.of(this._dateTime, this._offset);
    }
    /**
     * @return {Instant} an {@code Instant} representing the same instant, not null
     */
    toInstant(): Instant {
        return this._dateTime.toInstant(this._offset);
    }
    /**
     * @return {number} the number of seconds from the epoch of 1970-01-01T00:00:00Z
     */
    toEpochSecond(): number {
        return this._dateTime.toEpochSecond(this._offset);
    }
    isSupported(fieldOrUnit: TemporalField | TemporalUnit): boolean {
        if (fieldOrUnit instanceof ChronoField) {
            return fieldOrUnit.isDateBased() || fieldOrUnit.isTimeBased();
        }
        if (fieldOrUnit instanceof ChronoUnit) {
            return fieldOrUnit.isDateBased() || fieldOrUnit.isTimeBased();
        }
        return fieldOrUnit != null && fieldOrUnit.isSupportedBy(this);
    }
    override range(field: TemporalField) {
        if (field instanceof ChronoField) {
            if (field === ChronoField.INSTANT_SECONDS || field === ChronoField.OFFSET_SECONDS) {
                return field.range();
            }
            return this._dateTime.range(field);
        }
        return field.rangeRefinedBy(this);
    }
    _withAdjuster(adjuster: TemporalAdjuster): OffsetDateTime {
        requireNonNull(adjuster);
        // optimizations
        if (adjuster instanceof LocalDate || adjuster instanceof LocalTime || adjuster instanceof LocalDateTime) {
            return this._withDateTimeOffset(this._dateTime.with(adjuster), this._offset);
        }
        else if (adjuster instanceof Instant) {
            return OffsetDateTime.ofInstant(adjuster, this._offset);
        }
        else if (adjuster instanceof ZoneOffset) {
            return this._withDateTimeOffset(this._dateTime, adjuster);
        }
        else if (adjuster instanceof OffsetDateTime) {
            return adjuster;
        }
        return adjuster.adjustInto(this) as OffsetDateTime;
    }
    _withField(field: TemporalField, newValue: number): OffsetDateTime {
        requireNonNull(field);
        if (field instanceof ChronoField) {
            const f = field;
            switch (f) {
                case ChronoField.INSTANT_SECONDS: return OffsetDateTime.ofInstant(Instant.ofEpochSecond(newValue, this.nano()), this._offset);
                case ChronoField.OFFSET_SECONDS: {
                    return this._withDateTimeOffset(this._dateTime, ZoneOffset.ofTotalSeconds(f.checkValidIntValue(newValue)));
                }
            }
            return this._withDateTimeOffset(this._dateTime.with(field, newValue), this._offset);
        }
        return field.adjustInto(this, newValue) as OffsetDateTime;
    }
    _withDateTimeOffset(dateTime: LocalDateTime, offset: ZoneOffset): OffsetDateTime {
        if (this._dateTime === dateTime && this._offset.equals(offset)) {
            return this;
        }
        return new OffsetDateTime(dateTime, offset);
    }
    /**
     * @param {int} year
     * @return {OffsetDateTime}
     */
    withYear(year: number): OffsetDateTime {
        return this._withDateTimeOffset(this._dateTime.withYear(year), this._offset);
    }
    /**
     * @param {int} month
     * @return {OffsetDateTime}
     */
    withMonth(month: number): OffsetDateTime {
        return this._withDateTimeOffset(this._dateTime.withMonth(month), this._offset);
    }
    /**
     * @param {int} dayOfMonth
     * @return {OffsetDateTime}
     */
    withDayOfMonth(dayOfMonth: number): OffsetDateTime {
        return this._withDateTimeOffset(this._dateTime.withDayOfMonth(dayOfMonth), this._offset);
    }
    /**
     * @param {int} dayOfYear
     * @return {OffsetDateTime}
     */
    withDayOfYear(dayOfYear: number): OffsetDateTime {
        return this._withDateTimeOffset(this._dateTime.withDayOfYear(dayOfYear), this._offset);
    }
    /**
     * @param {int} hour
     * @return {OffsetDateTime}
     */
    withHour(hour: number): OffsetDateTime {
        return this._withDateTimeOffset(this._dateTime.withHour(hour), this._offset);
    }
    /**
     * @param {int} minute
     * @return {OffsetDateTime}
     */
    withMinute(minute: number): OffsetDateTime {
        return this._withDateTimeOffset(this._dateTime.withMinute(minute), this._offset);
    }
    /**
     * @param {int} second
     * @return {OffsetDateTime}
     */
    withSecond(second: number): OffsetDateTime {
        return this._withDateTimeOffset(this._dateTime.withSecond(second), this._offset);
    }
    /**
     * @param {int} nanoOfSecond
     * @return {OffsetDateTime}
     */
    withNano(nanoOfSecond: number): OffsetDateTime {
        return this._withDateTimeOffset(this._dateTime.withNano(nanoOfSecond), this._offset);
    }
    /**
     * @param {ZoneOffset} offset
     * @return {OffsetDateTime}
     */
    withOffsetSameLocal(offset: ZoneOffset): OffsetDateTime {
        requireNonNull(offset, 'offset');
        return this._withDateTimeOffset(this._dateTime, offset);
    }
    /**
     * @param {ZoneOffset} offset
     * @return {OffsetDateTime}
     */
    withOffsetSameInstant(offset: ZoneOffset): OffsetDateTime {
        requireNonNull(offset, 'offset');
        if (offset.equals(this._offset)) {
            return this;
        }
        const difference = offset.totalSeconds() - this._offset.totalSeconds();
        const adjusted = this._dateTime.plusSeconds(difference);
        return new OffsetDateTime(adjusted, offset);
    }
    /**
     * @param {TemporalUnit} unit
     * @return {OffsetDateTime}
     */
    truncatedTo(unit: TemporalUnit): OffsetDateTime {
        return this._withDateTimeOffset(this._dateTime.truncatedTo(unit), this._offset);
    }
    _plusAmount(amount: TemporalAmount): OffsetDateTime {
        requireNonNull(amount, 'amount');
        return amount.addTo(this);
    }
    _plusUnit(amountToAdd: number, unit: TemporalUnit): OffsetDateTime {
        if (unit instanceof ChronoUnit) {
            return this._withDateTimeOffset(this._dateTime.plus(amountToAdd, unit), this._offset);
        }
        return unit.addTo(this, amountToAdd);
    }
    /**
     * @param {int} years
     * @return {OffsetTime}
     */
    plusYears(years: number): OffsetDateTime {
        return this._withDateTimeOffset(this._dateTime.plusYears(years), this._offset);
    }
    /**
     * @param {int} months
     * @return {OffsetTime}
     */
    plusMonths(months: number): OffsetDateTime {
        return this._withDateTimeOffset(this._dateTime.plusMonths(months), this._offset);
    }
    /**
     * @param {int} weeks
     * @return {OffsetTime}
     */
    plusWeeks(weeks: number): OffsetDateTime {
        return this._withDateTimeOffset(this._dateTime.plusWeeks(weeks), this._offset);
    }
    /**
     * @param {int} days
     * @return {OffsetTime}
     */
    plusDays(days: number): OffsetDateTime {
        return this._withDateTimeOffset(this._dateTime.plusDays(days), this._offset);
    }
    /**
     * @param {int} hours
     * @return {OffsetTime}
     */
    plusHours(hours: number): OffsetDateTime {
        return this._withDateTimeOffset(this._dateTime.plusHours(hours), this._offset);
    }
    /**
     * @param {int} minutes
     * @return {OffsetTime}
     */
    plusMinutes(minutes: number): OffsetDateTime {
        return this._withDateTimeOffset(this._dateTime.plusMinutes(minutes), this._offset);
    }
    /**
     * @param {int} seconds
     * @return {OffsetTime}
     */
    plusSeconds(seconds: number): OffsetDateTime {
        return this._withDateTimeOffset(this._dateTime.plusSeconds(seconds), this._offset);
    }
    /**
     * @param {int} nanos
     * @return {OffsetTime}
     */
    plusNanos(nanos: number): OffsetDateTime {
        return this._withDateTimeOffset(this._dateTime.plusNanos(nanos), this._offset);
    }
    _minusAmount(amount: TemporalAmount): OffsetDateTime {
        requireNonNull(amount);
        return amount.subtractFrom(this);
    }
    _minusUnit(amountToSubtract: number, unit: TemporalUnit): OffsetDateTime {
        return this.plus(-1 * amountToSubtract, unit);
    }
    /**
     * @param {int} years
     * @return {OffsetTime}
     */
    minusYears(years: number): OffsetDateTime {
        return this._withDateTimeOffset(this._dateTime.minusYears(years), this._offset);
    }
    /**
     * @param {int} months
     * @return {OffsetTime}
     */
    minusMonths(months: number): OffsetDateTime {
        return this._withDateTimeOffset(this._dateTime.minusMonths(months), this._offset);
    }
    /**
     * @param {int} weeks
     * @return {OffsetTime}
     */
    minusWeeks(weeks: number): OffsetDateTime {
        return this._withDateTimeOffset(this._dateTime.minusWeeks(weeks), this._offset);
    }
    /**
     * @param {int} days
     * @return {OffsetTime}
     */
    minusDays(days: number): OffsetDateTime {
        return this._withDateTimeOffset(this._dateTime.minusDays(days), this._offset);
    }
    /**
     * @param {int} hours
     * @return {OffsetTime}
     */
    minusHours(hours: number): OffsetDateTime {
        return this._withDateTimeOffset(this._dateTime.minusHours(hours), this._offset);
    }
    /**
     * @param {int} minutes
     * @return {OffsetTime}
     */
    minusMinutes(minutes: number): OffsetDateTime {
        return this._withDateTimeOffset(this._dateTime.minusMinutes(minutes), this._offset);
    }
    /**
     * @param {int} seconds
     * @return {OffsetTime}
     */
    minusSeconds(seconds: number): OffsetDateTime {
        return this._withDateTimeOffset(this._dateTime.minusSeconds(seconds), this._offset);
    }
    /**
     * @param {int} nanos
     * @return {OffsetTime}
     */
    minusNanos(nanos: number): OffsetDateTime {
        return this._withDateTimeOffset(this._dateTime.minusNanos(nanos), this._offset);
    }
    compareTo(other: OffsetDateTime): number {
        requireNonNull(other, 'other');
        requireInstance(other, OffsetDateTime, 'other');
        if (this.offset().equals(other.offset())) {
            return this.toLocalDateTime().compareTo(other.toLocalDateTime());
        }
        let cmp = MathUtil.compareNumbers(this.toEpochSecond(), other.toEpochSecond());
        if (cmp === 0) {
            cmp = this.toLocalTime().nano() - other.toLocalTime().nano();
            if (cmp === 0) {
                cmp = this.toLocalDateTime().compareTo(other.toLocalDateTime());
            }
        }
        return cmp;
    }
    /**
     * @param {OffsetDateTime} other
     * @return {boolean}
     */
    isAfter(other: OffsetDateTime): boolean {
        requireNonNull(other, 'other');
        const thisEpochSec = this.toEpochSecond();
        const otherEpochSec = other.toEpochSecond();
        return thisEpochSec > otherEpochSec || (thisEpochSec === otherEpochSec && this.toLocalTime().nano() > other.toLocalTime().nano());
    }
    /**
     * @param {OffsetDateTime} other
     * @return {boolean}
     */
    isBefore(other: OffsetDateTime): boolean {
        requireNonNull(other, 'other');
        const thisEpochSec = this.toEpochSecond();
        const otherEpochSec = other.toEpochSecond();
        return thisEpochSec < otherEpochSec || (thisEpochSec === otherEpochSec && this.toLocalTime().nano() < other.toLocalTime().nano());
    }
    /**
     * @param {OffsetDateTime} other
     * @return {boolean}
     */
    isEqual(other: OffsetDateTime): boolean {
        requireNonNull(other, 'other');
        return this.toEpochSecond() === other.toEpochSecond() && this.toLocalTime().nano() === other.toLocalTime().nano();
    }
    //-----------------------------------------------------------------------
    /**
     * @param other
     * @return {boolean}
     */
    equals(other: unknown): boolean {
        if (this === other) {
            return true;
        }
        if (other instanceof OffsetDateTime) {
            return this._dateTime.equals(other._dateTime) && this._offset.equals(other._offset);
        }
        return false;
    }
    /**
     * @return {number}
     */
    hashCode(): number {
        return this._dateTime.hashCode() ^ this._offset.hashCode();
    }
    toString(): string {
        return this._dateTime.toString() + this._offset.toString();
    }
    /**
     *
     * @return {string} same as {@link LocalDateTime.toString}
     */
    toJSON(): string {
        return this.toString();
    }
    /**
     * @param {DateTimeFormatter} formatter
     * @return {string}
     */
    format(formatter: DateTimeFormatter): string {
        requireNonNull(formatter, 'formatter');
        return formatter.format(this);
    }
}
export function _init(): void {
    OffsetDateTime.MIN = LocalDateTime.MIN.atOffset(ZoneOffset.MAX);
    OffsetDateTime.MAX = LocalDateTime.MAX.atOffset(ZoneOffset.MIN);
    OffsetDateTime.FROM = createTemporalQuery('OffsetDateTime.FROM', (temporal: TemporalAccessor): OffsetDateTime => {
        return OffsetDateTime.from(temporal);
    });
}
