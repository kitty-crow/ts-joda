import type { DateTimeFormatter } from "../format/DateTimeFormatter.ts";
import type { TemporalQuery } from "../temporal/TemporalQuery.ts";
/*
 * @copyright (c) 2016, Philipp Thürwächter & Pattrick Hüper
 * @copyright (c) 2007-present, Stephen Colebourne & Michael Nascimento Santos
 * @license BSD-3-Clause (see LICENSE in the root directory of this source tree)
 */
import { requireNonNull } from "../assert.ts";
import { Instant } from "../Instant.ts";
import { LocalDate } from "../LocalDate.ts";
import type { LocalTime } from "../LocalTime.ts";
import type { ZoneId } from "../ZoneId.ts";
import type { ZoneOffset } from "../ZoneOffset.ts";
import type { ChronoLocalDate } from "./ChronoLocalDate.ts";
import type { ChronoLocalDateTime } from "./ChronoLocalDateTime.ts";
import { MathUtil } from "../MathUtil.ts";
import { ChronoUnit } from "../temporal/ChronoUnit.ts";
import { Temporal } from "../temporal/Temporal.ts";
import { TemporalQueries } from "../temporal/TemporalQueries.ts";
export abstract class ChronoZonedDateTime extends Temporal {
    abstract zone(): ZoneId;
    abstract offset(): ZoneOffset;
    abstract toLocalDate(): ChronoLocalDate;
    abstract toLocalTime(): LocalTime;
    abstract toLocalDateTime(): ChronoLocalDateTime;

    query<R>(query: TemporalQuery<R>): R | null {
        if (query === TemporalQueries.zoneId() || query === TemporalQueries.zone()) {
            return this.zone() as unknown as R;
        }
        else if (query === TemporalQueries.chronology()) {
            return this.toLocalDate().chronology() as unknown as R;
        }
        else if (query === TemporalQueries.precision()) {
            return ChronoUnit.NANOS as unknown as R;
        }
        else if (query === TemporalQueries.offset()) {
            return this.offset() as unknown as R;
        }
        else if (query === TemporalQueries.localDate()) {
            return LocalDate.ofEpochDay(this.toLocalDate().toEpochDay()) as unknown as R;
        }
        else if (query === TemporalQueries.localTime()) {
            return this.toLocalTime() as unknown as R;
        }
        return super.query(query);
    }
    /**
     * Outputs this date-time as a string using the formatter.
     *
     * @param {DateTimeFormatter} formatter - the formatter to use, not null
     * @return {string} the formatted date-time string, not null
     * @throws DateTimeException if an error occurs during printing
     */
    format(formatter: DateTimeFormatter): string {
        requireNonNull(formatter, 'formatter');
        return formatter.format(this);
    }
    /**
     * Converts this date-time to an {@link Instant}.
     *
     * This returns an {@link Instant} representing the same point on the
     * time-line as this date-time. The calculation combines the
     * local date-time (see {@link toLocalDateTime}) and
     * offset (see {@link getOffset}).
     *
     * @return {Instant} an {@link Instant} representing the same instant, not null
     */
    toInstant(): Instant {
        return Instant.ofEpochSecond(this.toEpochSecond(), this.toLocalTime().nano());
    }
    /**
     * Converts this date-time to the number of seconds from the epoch
     * of 1970-01-01T00:00:00Z.
     *
     * This uses the local date-time (see {@link toLocalDateTime}) and
     * offset (see {@link getOffset}) to calculate the epoch-second value,
     * which is the number of elapsed seconds from 1970-01-01T00:00:00Z.
     * Instants on the time-line after the epoch are positive, earlier are negative.
     *
     * @return {number} the number of seconds from the epoch of 1970-01-01T00:00:00Z
     */
    toEpochSecond(): number {
        const epochDay = this.toLocalDate().toEpochDay();
        let secs = epochDay * 86400 + this.toLocalTime().toSecondOfDay();
        secs -= this.offset().totalSeconds();
        return secs;
    }
    /**
      * Compares this date-time to another date-time, including the chronology.
      *
      * The comparison is based first on the instant, then on the local date-time,
      * then on the zone ID, then on the chronology.
      * It is "consistent with equals", as defined by {@link Comparable}.
      *
      * If all the date-time objects being compared are in the same chronology, then the
      * additional chronology stage is not required.
      *
      * @param {ChronoZonedDateTime} other - the other date-time to compare to, not null
      * @return {number} the comparator value, negative if less, positive if greater
      */
    compareTo(other: ChronoZonedDateTime): number {
        requireNonNull(other, 'other');
        let cmp = MathUtil.compareNumbers(this.toEpochSecond(), other.toEpochSecond());
        if (cmp === 0) {
            cmp = this.toLocalTime().nano() - other.toLocalTime().nano();
            if (cmp === 0) {
                cmp = this.toLocalDateTime().compareTo(other.toLocalDateTime());
                if (cmp === 0) {
                    cmp = strcmp(this.zone().id(), other.zone().id());
                    // we only support iso for now
                    //if (cmp === 0) {
                    //    cmp = toLocalDate().getChronology().compareTo(other.toLocalDate().getChronology());
                    //}
                }
            }
        }
        return cmp;
    }
    //-----------------------------------------------------------------------
    /**
     * Checks if the instant of this date-time is after that of the specified date-time.
     *
     * This method differs from the comparison in {@link compareTo} in that it
     * only compares the instant of the date-time. This is equivalent to using
     * `dateTime1.toInstant().isAfter(dateTime2.toInstant())`.
     *
     * @param {!ChronoZonedDateTime} other - the other date-time to compare to, not null
     * @return {boolean} true if this is after the specified date-time
     */
    isAfter(other: ChronoZonedDateTime): boolean {
        requireNonNull(other, 'other');
        const thisEpochSec = this.toEpochSecond();
        const otherEpochSec = other.toEpochSecond();
        return thisEpochSec > otherEpochSec ||
            (thisEpochSec === otherEpochSec && this.toLocalTime().nano() > other.toLocalTime().nano());
    }
    /**
     * Checks if the instant of this date-time is before that of the specified date-time.
     *
     * This method differs from the comparison in {@link compareTo} in that it
     * only compares the instant of the date-time. This is equivalent to using
     * `dateTime1.toInstant().isBefore(dateTime2.toInstant())`.
     *
     * @param {!ChronoZonedDateTime} other - the other date-time to compare to, not null
     * @return {boolean} true if this point is before the specified date-time
     */
    isBefore(other: ChronoZonedDateTime): boolean {
        requireNonNull(other, 'other');
        const thisEpochSec = this.toEpochSecond();
        const otherEpochSec = other.toEpochSecond();
        return thisEpochSec < otherEpochSec ||
            (thisEpochSec === otherEpochSec && this.toLocalTime().nano() < other.toLocalTime().nano());
    }
    /**
     * Checks if the instant of this date-time is equal to that of the specified date-time.
     *
     * This method differs from the comparison in {@link compareTo} and {@link equals}
     * in that it only compares the instant of the date-time. This is equivalent to using
     * `dateTime1.toInstant().equals(dateTime2.toInstant())`.
     *
     * @param {!ChronoZonedDateTime} other - the other date-time to compare to, not null
     * @return {boolean} true if the instant equals the instant of the specified date-time
     */
    isEqual(other: ChronoZonedDateTime): boolean {
        requireNonNull(other, 'other');
        return this.toEpochSecond() === other.toEpochSecond() &&
            this.toLocalTime().nano() === other.toLocalTime().nano();
    }
    //-----------------------------------------------------------------------
    /**
     * Checks if this date-time is equal to another date-time.
     *
     * The comparison is based on the offset date-time and the zone.
     * To compare for the same instant on the time-line, use {@link compareTo}.
     * Only objects of type {@link ChronoZoneDateTime} are compared, other types return false.
     *
     * @param {*} other  the object to check, null returns false
     * @return {boolean} true if this is equal to the other date-time
     */
    equals(other: unknown): boolean {
        if (this === other) {
            return true;
        }
        if (other instanceof ChronoZonedDateTime) {
            return this.compareTo(other) === 0;
        }
        return false;
    }
}
function strcmp(a: string, b: string): 0 | 1 | -1 {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
}
