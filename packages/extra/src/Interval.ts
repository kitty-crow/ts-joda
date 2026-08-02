/*
 * @copyright (c) 2016, Philipp Thürwächter & Pattrick Hüper
 * @copyright (c) 2007-present, Stephen Colebourne & Michael Nascimento Santos
 * @license BSD-3-Clause (see LICENSE in the root directory of this source tree)
 */

import {
    DateTimeException,
    DateTimeParseException,
    Duration,
    IllegalArgumentException,
    Instant,
    ZonedDateTime,
} from '@js-joda/core';
import { requireInstance, requireNonNull } from './assert';

/** An immutable half-open interval between two instants. */
export class Interval {
    private readonly _start: Instant;
    private readonly _end: Instant;

    static of(startInstant: Instant, endInstantOrDuration: Instant | Duration): Interval {
        if (endInstantOrDuration instanceof Duration) {
            return Interval.ofInstantDuration(startInstant, endInstantOrDuration);
        }
        return Interval.ofInstantInstant(startInstant, endInstantOrDuration);
    }

    static ofInstantInstant(startInclusive: Instant, endExclusive: Instant): Interval {
        requireNonNull(startInclusive, 'startInclusive');
        requireNonNull(endExclusive, 'endExclusive');
        requireInstance(startInclusive, Instant, 'startInclusive');
        requireInstance(endExclusive, Instant, 'endExclusive');
        if (endExclusive.isBefore(startInclusive)) {
            throw new DateTimeException('End instant must on or after start instant');
        }
        return new Interval(startInclusive, endExclusive);
    }

    static ofInstantDuration(startInclusive: Instant, duration: Duration): Interval {
        requireNonNull(startInclusive, 'startInclusive');
        requireNonNull(duration, 'duration');
        requireInstance(startInclusive, Instant, 'startInclusive');
        requireInstance(duration, Duration, 'duration');
        if (duration.isNegative()) {
            throw new DateTimeException('Duration must not be zero or negative');
        }
        return new Interval(startInclusive, startInclusive.plus(duration));
    }

    static parse(text: string): Interval;
    static parse(text: unknown): Interval {
        const input = requireNonNull(text, 'text');
        if (typeof input !== 'string') {
            const value = input as { readonly constructor: { readonly name: string } };
            throw new IllegalArgumentException(`text must be a string, but is ${value.constructor.name}`);
        }

        for (let i = 0; i < input.length; i += 1) {
            if (input.charAt(i) !== '/') {
                continue;
            }

            const first = input.charAt(0);
            if (first === 'P' || first === 'p') {
                const duration = Duration.parse(input.substring(0, i));
                const end = ZonedDateTime.parse(input.substring(i + 1, input.length)).toInstant();
                return Interval.of(end.minus(duration), end);
            }

            const start = ZonedDateTime.parse(input.substring(0, i)).toInstant();
            if (i + 1 < input.length) {
                const next = input.charAt(i + 1);
                if (next === 'P' || next === 'p') {
                    const duration = Duration.parse(input.substring(i + 1, input.length));
                    return Interval.of(start, start.plus(duration));
                }
            }
            const end = ZonedDateTime.parse(input.substring(i + 1, input.length)).toInstant();
            return Interval.of(start, end);
        }

        throw new DateTimeParseException('Interval cannot be parsed, no forward slash found', input, 0);
    }

    private constructor(startInclusive: Instant, endExclusive: Instant) {
        this._start = startInclusive;
        this._end = endExclusive;
    }

    start(): Instant {
        return this._start;
    }

    end(): Instant {
        return this._end;
    }

    isEmpty(): boolean {
        return this._start.equals(this._end);
    }

    isUnboundedStart(): boolean {
        return this._start.equals(Instant.MIN);
    }

    isUnboundedEnd(): boolean {
        return this._end.equals(Instant.MAX);
    }

    withStart(start: Instant): Interval {
        return Interval.of(start, this._end);
    }

    withEnd(end: Instant): Interval {
        return Interval.of(this._start, end);
    }

    contains(instant: Instant): boolean {
        requireNonNull(instant, 'instant');
        requireInstance(instant, Instant, 'instant');
        return this._start.compareTo(instant) <= 0
            && (instant.compareTo(this._end) < 0 || this.isUnboundedEnd());
    }

    encloses(other: Interval): boolean {
        requireNonNull(other, 'other');
        requireInstance(other, Interval, 'other');
        return this._start.compareTo(other.start()) <= 0
            && other.end().compareTo(this._end) <= 0;
    }

    abuts(other: Interval): boolean {
        requireNonNull(other, 'other');
        requireInstance(other, Interval, 'other');
        return !this._end.equals(other.start()) !== !this._start.equals(other.end());
    }

    isConnected(other: Interval): boolean {
        requireNonNull(other, 'other');
        requireInstance(other, Interval, 'other');
        return this.equals(other)
            || (this._start.compareTo(other.end()) <= 0
                && other.start().compareTo(this._end) <= 0);
    }

    overlaps(other: Interval): boolean {
        requireNonNull(other, 'other');
        requireInstance(other, Interval, 'other');
        return other.equals(this)
            || (this._start.compareTo(other.end()) < 0
                && other.start().compareTo(this._end) < 0);
    }

    intersection(other: Interval): Interval {
        requireNonNull(other, 'other');
        requireInstance(other, Interval, 'other');
        if (!this.isConnected(other)) {
            throw new DateTimeException(`Intervals do not connect: ${this} and ${other}`);
        }

        const start = this._start.compareTo(other.start());
        const end = this._end.compareTo(other.end());
        if (start >= 0 && end <= 0) {
            return this;
        }
        if (start <= 0 && end >= 0) {
            return other;
        }
        return Interval.of(
            start >= 0 ? this._start : other.start(),
            end <= 0 ? this._end : other.end(),
        );
    }

    union(other: Interval): Interval {
        requireNonNull(other, 'other');
        requireInstance(other, Interval, 'other');
        if (!this.isConnected(other)) {
            throw new DateTimeException(`Intervals do not connect: ${this} and ${other}`);
        }

        const start = this._start.compareTo(other.start());
        const end = this._end.compareTo(other.end());
        if (start >= 0 && end <= 0) {
            return other;
        }
        if (start <= 0 && end >= 0) {
            return this;
        }
        return Interval.of(
            start >= 0 ? other.start() : this._start,
            end <= 0 ? other.end() : this._end,
        );
    }

    span(other: Interval): Interval {
        requireNonNull(other, 'other');
        requireInstance(other, Interval, 'other');
        const start = this._start.compareTo(other.start());
        const end = this._end.compareTo(other.end());
        return Interval.of(
            start >= 0 ? other.start() : this._start,
            end <= 0 ? other.end() : this._end,
        );
    }

    isAfter(instantOrInterval: Instant | Interval): boolean {
        return instantOrInterval instanceof Instant
            ? this.isAfterInstant(instantOrInterval)
            : this.isAfterInterval(instantOrInterval);
    }

    isBefore(instantOrInterval: Instant | Interval): boolean {
        return instantOrInterval instanceof Instant
            ? this.isBeforeInstant(instantOrInterval)
            : this.isBeforeInterval(instantOrInterval);
    }

    isAfterInstant(instant: Instant): boolean {
        return this._start.compareTo(instant) > 0;
    }

    isBeforeInstant(instant: Instant): boolean {
        return this._end.compareTo(instant) <= 0 && this._start.compareTo(instant) < 0;
    }

    isAfterInterval(interval: Interval): boolean {
        return this._start.compareTo(interval.end()) >= 0 && !interval.equals(this);
    }

    isBeforeInterval(interval: Interval): boolean {
        return this._end.compareTo(interval.start()) <= 0 && !interval.equals(this);
    }

    toDuration(): Duration {
        return Duration.between(this._start, this._end);
    }

    equals(obj: unknown): boolean {
        if (this === obj) {
            return true;
        }
        return obj instanceof Interval
            && this._start.equals(obj.start())
            && this._end.equals(obj.end());
    }

    hashCode(): number {
        return this._start.hashCode() ^ this._end.hashCode();
    }

    toString(): string {
        return `${this._start.toString()}/${this._end.toString()}`;
    }
}

export function _init(): void {
    const type = Interval as typeof Interval & { ALL: Interval };
    type.ALL = Interval.of(Instant.MIN, Instant.MAX);
}
