/*
 * @copyright (c) 2016, Philipp Thürwächter & Pattrick Hüper
 * @license BSD-3-Clause (see LICENSE in the root directory of this source tree)
 */
import { ZoneRules } from "./ZoneRules.ts";
import { ZoneOffset } from "../ZoneOffset.ts";
import type { Instant } from "../Instant.ts";
import type { LocalDateTime } from "../LocalDateTime.ts";
import type { Duration } from "../Duration.ts";
import type { ZoneOffsetTransition } from "./ZoneOffsetTransition.ts";
import type { ZoneOffsetTransitionRule } from './ZoneOffsetTransitionRule.ts';
import { DateTimeException } from "../errors.ts";
export class SystemDefaultZoneRules extends ZoneRules {
    isFixedOffset(): boolean {
        return false;
    }
    /**
     *
     * @param {Instant} instant
     * @returns {ZoneOffset}
     */
    offsetOfInstant(instant: Instant): ZoneOffset {
        const offsetInMinutes = new Date(instant.toEpochMilli()).getTimezoneOffset();
        return ZoneOffset.ofTotalMinutes(offsetInMinutes * -1);
    }
    /**
     *
     * @param {number} epochMilli
     * @returns {ZoneOffset}
     */
    offsetOfEpochMilli(epochMilli: number): ZoneOffset {
        const offsetInMinutes = new Date(epochMilli).getTimezoneOffset();
        return ZoneOffset.ofTotalMinutes(offsetInMinutes * -1);
    }
    /**
     * This implementation is NOT returning the best value in a gap or overlap situation
     * as specified at {@link ZoneRules.offsetOfLocalDateTime}.
     *
     * The calculated offset depends Date.prototype.getTimezoneOffset and its not specified
     * at the ECMA-262 specification how to handle daylight savings gaps/ overlaps.
     *
     * The Chrome Browser version 49 is returning the next transition offset in a gap/overlap situation,
     * other browsers/ engines might do it in the same way.
     *
     * @param {LocalDateTime} localDateTime
     * @returns {ZoneOffset}
     */
    offsetOfLocalDateTime(localDateTime: LocalDateTime): ZoneOffset {
        const epochMilli = localDateTime.toEpochSecond(ZoneOffset.UTC) * 1000;
        const offsetInMinutesBeforePossibleTransition = new Date(epochMilli).getTimezoneOffset();
        const epochMilliSystemZone = epochMilli + offsetInMinutesBeforePossibleTransition * 60000;
        const offsetInMinutesAfterPossibleTransition = new Date(epochMilliSystemZone).getTimezoneOffset();
        return ZoneOffset.ofTotalMinutes(offsetInMinutesAfterPossibleTransition * -1);
    }
    /**
     *
     * @param localDateTime
     * @return {ZoneOffset[]}
     */
    validOffsets(localDateTime: LocalDateTime): ZoneOffset[] {
        return [this.offsetOfLocalDateTime(localDateTime)];
    }
    /**
     * @return null, not supported
     */
    transition(_localDateTime: LocalDateTime): null {
        return null;
    }
    /**
     *
     * @param instant
     * @return {ZoneOffset}
     */
    standardOffset(instant: Instant): ZoneOffset {
        return this.offsetOfInstant(instant);
    }
    /**
     * @throws DateTimeException not supported
     */
    daylightSavings(_instant: Instant): Duration {
        return this._throwNotSupported();
    }
    /**
     * @throws DateTimeException not supported
     */
    isDaylightSavings(_instant: Instant): boolean {
        return this._throwNotSupported();
    }
    /**
     *
     * @param {LocalDateTime} dateTime
     * @param {ZoneOffset} offset
     * @return {boolean}
     */
    isValidOffset(dateTime: LocalDateTime, offset: ZoneOffset): boolean {
        return this.offsetOfLocalDateTime(dateTime).equals(offset);
    }
    /**
     * @throws DateTimeException not supported
     */
    nextTransition(_instant: Instant): ZoneOffsetTransition | null {
        return this._throwNotSupported();
    }
    /**
     * @throws DateTimeException not supported
     */
    previousTransition(_instant: Instant): ZoneOffsetTransition | null {
        return this._throwNotSupported();
    }
    /**
     * @throws DateTimeException not supported
     */
    transitions(): ZoneOffsetTransition[] {
        return this._throwNotSupported();
    }
    /**
     * @throws DateTimeException not supported
     */
    transitionRules(): ZoneOffsetTransitionRule[] {
        return this._throwNotSupported();
    }
    /**
     * @throws DateTimeException not supported
     */
    private _throwNotSupported(): never {
        throw new DateTimeException('not supported operation');
    }
    //-----------------------------------------------------------------------
    /**
     *
     * @param {*} other
     * @returns {boolean}
     */
    equals(other: unknown): boolean {
        if (this === other || other instanceof SystemDefaultZoneRules) {
            return true;
        }
        else {
            return false;
        }
    }
    /**
     *
     * @returns {string}
     */
    toString(): string {
        return 'SYSTEM';
    }
}
