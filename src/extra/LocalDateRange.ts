/**
 * @copyright (c) 2016, Philipp Thürwächter & Pattrick Hüper & Michał Sobkiewicz
 * @copyright (c) 2007-present, Stephen Colebourne & Michael Nascimento Santos
 * @license BSD-3-Clause (see LICENSE in the root directory of this source tree)
 */

import {
    ArithmeticException,
    DateTimeException,
    DateTimeParseException,
    IllegalArgumentException,
    LocalDate,
    Period,
    type TemporalAdjuster,
} from '@js-joda/core';
import { requireInstance, requireNonNull } from './assert.ts';

const MINP1 = LocalDate.MIN.plusDays(1);
const MAXM1 = LocalDate.MAX.minusDays(1);

type LocalDateRangeType = typeof LocalDateRange & { ALL: LocalDateRange };

function type(): LocalDateRangeType {
    return LocalDateRange as LocalDateRangeType;
}

function className(value: unknown): string {
    return (value as { readonly constructor: { readonly name: string } }).constructor.name;
}

/** An immutable half-open range of local dates. */
export class LocalDateRange {
    private readonly _start: LocalDate;
    private readonly _end: LocalDate;

    static of(startInclusive: LocalDate, endExclusive: LocalDate): LocalDateRange;
    static of(startInclusive: LocalDate, period: Period): LocalDateRange;
    static of(startInclusive: unknown, endExclusiveOrPeriod: unknown): LocalDateRange {
        if (startInclusive instanceof LocalDate && endExclusiveOrPeriod instanceof LocalDate) {
            return LocalDateRange._ofLocalDateLocalDate(startInclusive, endExclusiveOrPeriod);
        }
        if (startInclusive instanceof LocalDate && endExclusiveOrPeriod instanceof Period) {
            return LocalDateRange._ofLocalDatePeriod(startInclusive, endExclusiveOrPeriod);
        }

        const parts: string[] = [];
        if (!(startInclusive instanceof LocalDate)) {
            parts.push(
                `startInclusive must be an instance of LocalDate but is ${className(startInclusive)}`,
            );
        }
        if (!(endExclusiveOrPeriod instanceof LocalDate || endExclusiveOrPeriod instanceof Period)) {
            parts.push(
                `endExclusiveOrPeriod must be an instance of LocalDate or Period but is ${className(endExclusiveOrPeriod)}`,
            );
        }
        throw new IllegalArgumentException(parts.join(' and '));
    }

    static _ofLocalDateLocalDate(
        startInclusive: LocalDate,
        endExclusive: LocalDate,
    ): LocalDateRange {
        requireNonNull(startInclusive, 'startInclusive');
        requireNonNull(endExclusive, 'endExclusive');
        requireInstance(startInclusive, LocalDate, 'startInclusive');
        requireInstance(endExclusive, LocalDate, 'endExclusive');
        return new LocalDateRange(startInclusive, endExclusive);
    }

    static _ofLocalDatePeriod(startInclusive: LocalDate, period: Period): LocalDateRange {
        requireNonNull(startInclusive, 'startInclusive');
        requireNonNull(period, 'period');
        requireInstance(startInclusive, LocalDate, 'startInclusive');
        requireInstance(period, Period, 'period');
        if (period.isNegative()) {
            throw new DateTimeException('Period must not be zero or negative');
        }
        return new LocalDateRange(startInclusive, startInclusive.plus(period));
    }

    static ofClosed(startInclusive: LocalDate, endInclusive: LocalDate): LocalDateRange {
        requireNonNull(startInclusive, 'startInclusive');
        requireNonNull(endInclusive, 'endInclusive');
        requireInstance(startInclusive, LocalDate, 'startInclusive');
        requireInstance(endInclusive, LocalDate, 'endInclusive');
        if (endInclusive.isBefore(startInclusive)) {
            throw new DateTimeException('Start date must be on or before end date');
        }
        const end = endInclusive.equals(LocalDate.MAX)
            ? LocalDate.MAX
            : endInclusive.plusDays(1);
        return new LocalDateRange(startInclusive, end);
    }

    static ofEmpty(date: LocalDate): LocalDateRange {
        requireNonNull(date, 'date');
        requireInstance(date, LocalDate, 'date');
        return new LocalDateRange(date, date);
    }

    static ofUnbounded(): LocalDateRange {
        return type().ALL;
    }

    static ofUnboundedStart(endExclusive: LocalDate): LocalDateRange {
        requireNonNull(endExclusive, 'endExclusive');
        requireInstance(endExclusive, LocalDate, 'endExclusive');
        return LocalDateRange.of(LocalDate.MIN, endExclusive);
    }

    static ofUnboundedEnd(startInclusive: LocalDate): LocalDateRange {
        return LocalDateRange.of(startInclusive, LocalDate.MAX);
    }

    static parse(text: string): LocalDateRange {
        requireNonNull(text, 'text');
        for (let i = 0; i < text.length; i += 1) {
            if (text[i] !== '/') {
                continue;
            }

            const first = text.charAt(0);
            if (first === 'P' || first === 'p') {
                const period = Period.parse(text.slice(0, i));
                const end = LocalDate.parse(text.slice(i + 1, text.length));
                return LocalDateRange.of(end.minus(period), end);
            }

            const start = LocalDate.parse(text.slice(0, i));
            if (i + 1 < text.length) {
                const next = text[i + 1];
                if (next === 'P' || next === 'p') {
                    const period = Period.parse(text.slice(i + 1, text.length));
                    return LocalDateRange.of(start, start.plus(period));
                }
            }
            const end = LocalDate.parse(text.slice(i + 1, text.length));
            return LocalDateRange.of(start, end);
        }
        throw new DateTimeParseException(
            'LocalDateRange cannot be parsed, no forward slash found',
            text,
            0,
        );
    }

    constructor(startInclusive: LocalDate, endExclusive: LocalDate) {
        requireNonNull(startInclusive, 'startInclusive');
        requireNonNull(endExclusive, 'endExclusive');
        requireInstance(startInclusive, LocalDate, 'startInclusive');
        requireInstance(endExclusive, LocalDate, 'endExclusive');
        if (endExclusive.isBefore(startInclusive)) {
            throw new DateTimeException('End date must be on or after start date');
        }
        if (startInclusive.equals(MAXM1)) {
            throw new DateTimeException('Range must not start at LocalDate.MAX.minusDays(1)');
        }
        if (endExclusive.equals(MINP1)) {
            throw new DateTimeException('Range must not end at LocalDate.MIN.plusDays(1)');
        }
        if (endExclusive.equals(LocalDate.MIN) || startInclusive.equals(LocalDate.MAX)) {
            throw new DateTimeException('Empty range must not be at LocalDate.MIN or LocalDate.MAX');
        }
        this._start = startInclusive;
        this._end = endExclusive;
    }

    start(): LocalDate {
        return this._start;
    }

    end(): LocalDate {
        return this._end;
    }

    endInclusive(): LocalDate {
        return this.isUnboundedEnd() ? LocalDate.MAX : this._end.minusDays(1);
    }

    isEmpty(): boolean {
        return this._start.equals(this._end);
    }

    isUnboundedStart(): boolean {
        return this._start.equals(LocalDate.MIN);
    }

    isUnboundedEnd(): boolean {
        return this._end.equals(LocalDate.MAX);
    }

    withStart(adjuster: TemporalAdjuster): LocalDateRange {
        return LocalDateRange.of(this._start.with(adjuster), this._end);
    }

    withEnd(adjuster: TemporalAdjuster): LocalDateRange {
        return LocalDateRange.of(this._start, this._end.with(adjuster));
    }

    contains(date: LocalDate): boolean {
        requireNonNull(date, 'date');
        return this._start.compareTo(date) <= 0
            && (date.compareTo(this._end) < 0 || this.isUnboundedEnd());
    }

    encloses(other: LocalDateRange): boolean {
        requireNonNull(other, 'other');
        return this._start.compareTo(other._start) <= 0
            && other._end.compareTo(this._end) <= 0;
    }

    abuts(other: LocalDateRange): boolean {
        requireNonNull(other, 'other');
        return this._end.equals(other._start) !== this._start.equals(other._end);
    }

    isConnected(other: LocalDateRange): boolean {
        requireNonNull(other, 'other');
        return this.equals(other)
            || (this._start.compareTo(other._end) <= 0
                && other._start.compareTo(this._end) <= 0);
    }

    overlaps(other: LocalDateRange): boolean {
        requireNonNull(other, 'other');
        return other.equals(this)
            || (this._start.compareTo(other._end) < 0
                && other._start.compareTo(this._end) < 0);
    }

    intersection(other: LocalDateRange): LocalDateRange {
        requireNonNull(other, 'other');
        if (!this.isConnected(other)) {
            throw new DateTimeException(`Ranges do not connect: ${this} and ${other}`);
        }
        const start = this._start.compareTo(other._start);
        const end = this._end.compareTo(other._end);
        if (start >= 0 && end <= 0) {
            return this;
        }
        if (start <= 0 && end >= 0) {
            return other;
        }
        return LocalDateRange.of(
            start >= 0 ? this._start : other._start,
            end <= 0 ? this._end : other._end,
        );
    }

    union(other: LocalDateRange): LocalDateRange {
        requireNonNull(other, 'other');
        if (!this.isConnected(other)) {
            throw new DateTimeException(`Ranges do not connect: ${this} and ${other}`);
        }
        const start = this._start.compareTo(other._start);
        const end = this._end.compareTo(other._end);
        if (start >= 0 && end <= 0) {
            return other;
        }
        if (start <= 0 && end >= 0) {
            return this;
        }
        return LocalDateRange.of(
            start >= 0 ? other._start : this._start,
            end <= 0 ? other._end : this._end,
        );
    }

    span(other: LocalDateRange): LocalDateRange {
        requireNonNull(other, 'other');
        const start = this._start.compareTo(other._start);
        const end = this._end.compareTo(other._end);
        return LocalDateRange.of(
            start >= 0 ? other._start : this._start,
            end <= 0 ? other._end : this._end,
        );
    }

    isAfter(date: LocalDate): boolean;
    isAfter(range: LocalDateRange): boolean;
    isAfter(value: unknown): boolean {
        if (value instanceof LocalDate) {
            return this._isAfterLocalDate(value);
        }
        if (value instanceof LocalDateRange) {
            return this._isAfterLocalDateRange(value);
        }
        throw new IllegalArgumentException(
            `localDateOrLocalDateRange must be an instance of LocalDate or LocalDateRange but is ${className(value)}`,
        );
    }

    isBefore(date: LocalDate): boolean;
    isBefore(range: LocalDateRange): boolean;
    isBefore(value: unknown): boolean {
        if (value instanceof LocalDate) {
            return this._isBeforeLocalDate(value);
        }
        if (value instanceof LocalDateRange) {
            return this._isBeforeLocalDateRange(value);
        }
        throw new IllegalArgumentException(
            `localDateOrLocalDateRange must be an instance of LocalDate or LocalDateRange but is ${className(value)}`,
        );
    }

    protected _isAfterLocalDate(date: LocalDate): boolean {
        return this._start.compareTo(date) > 0;
    }

    protected _isBeforeLocalDate(date: LocalDate): boolean {
        return this._end.compareTo(date) <= 0 && this._start.compareTo(date) < 0;
    }

    protected _isAfterLocalDateRange(other: LocalDateRange): boolean {
        return this._start.compareTo(other._end) >= 0 && !other.equals(this);
    }

    protected _isBeforeLocalDateRange(other: LocalDateRange): boolean {
        return this._end.compareTo(other._start) <= 0 && !other.equals(this);
    }

    lengthInDays(): number {
        if (this.isUnboundedStart() || this.isUnboundedEnd()) {
            return Number.POSITIVE_INFINITY;
        }
        return this._end.toEpochDay() - this._start.toEpochDay();
    }

    toPeriod(): Period {
        if (this.isUnboundedStart() || this.isUnboundedEnd()) {
            throw new ArithmeticException('Unbounded range cannot be converted to a Period');
        }
        return Period.between(this._start, this._end);
    }

    equals(obj: unknown): boolean {
        if (this === obj) {
            return true;
        }
        return obj instanceof LocalDateRange
            && this._start.equals(obj._start)
            && this._end.equals(obj._end);
    }

    hashCode(): number {
        return this._start.hashCode() ^ this._end.hashCode();
    }

    toString(): string {
        return `${this._start.toString()}/${this._end.toString()}`;
    }
}

export function _init(): void {
    type().ALL = new LocalDateRange(LocalDate.MIN, LocalDate.MAX);
}
