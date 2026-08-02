/*
 * @copyright (c) 2016, Philipp Thürwächter & Pattrick Hüper
 * @license BSD-3-Clause (see LICENSE in the root directory of this source tree)
 */
import { IllegalArgumentException } from "./errors.ts";
import { LocalDate } from "./LocalDate.ts";
import { LocalDateTime } from "./LocalDateTime.ts";
import { ZonedDateTime } from "./ZonedDateTime.ts";
import { ZoneId } from "./ZoneId.ts";
import { Instant } from "./Instant.ts";
class ToNativeJsConverter {
    instant!: Instant;
    /**
     * @param {!(LocalDate|LocalDateTime|ZonedDateTime|Instant)} temporal - a joda temporal instance
     * @param {ZoneId} [zone] - the zone of the temporal,
     *  the default value for LocalDate and LocalDateTime is ZoneId.systemDefault().
     */
    constructor(temporal: (Instant | ZonedDateTime | LocalDateTime | LocalDate) | (ZonedDateTime | LocalDateTime | LocalDate), zone: ZoneId | undefined) {
        let zonedDateTime;
        if (temporal instanceof Instant) {
            this.instant = temporal;
            return;
        }
        else if (temporal instanceof LocalDate) {
            zone = zone == null ? ZoneId.systemDefault() : zone;
            zonedDateTime = temporal.atStartOfDay(zone);
        }
        else if (temporal instanceof LocalDateTime) {
            zone = zone == null ? ZoneId.systemDefault() : zone;
            zonedDateTime = temporal.atZone(zone);
        }
        else if (temporal instanceof ZonedDateTime) {
            if (zone == null) {
                zonedDateTime = temporal;
            }
            else {
                zonedDateTime = temporal.withZoneSameInstant(zone);
            }
        }
        else {
            throw new IllegalArgumentException(`unsupported instance for convert operation:${temporal}`);
        }
        this.instant = zonedDateTime.toInstant();
    }
    /**
     *
     * @returns {Date}
     */
    toDate(): Date {
        return new Date(this.instant.toEpochMilli());
    }
    /**
     *
     * @returns {number}
     */
    toEpochMilli(): number {
        return this.instant.toEpochMilli();
    }
}
/**
 * converts a LocalDate, LocalDateTime or ZonedDateTime to a native Javascript Date.
 *
 * In a first step the temporal is converted to an Instant by adding implicit values.
 *
 * A LocalDate is implicit set to a LocalDateTime at start of day.
 * A LocalDateTime is implicit set to a ZonedDateTime with
 * the passed zone or if null, with the system default time zone.
 * A ZonedDateTime is converted to an Instant, if a zone is specified the zonedDateTime is adjusted to this
 * zone, keeping the same Instant.
 *
 * In a second step the instant is converted to a native Javascript Date
 *
 * default zone for LocalDate and LocalDateTime is ZoneId.systemDefault().
 *
 * @example
 * convert(localDate).toDate() // returns a javascript Date
 * convert(localDate).toEpochMilli()   // returns the epochMillis
 *
 * @param {!(LocalDate|LocalDateTime|ZonedDateTime)} temporal - a joda temporal instance
 * @param {ZoneId} [zone] - the zone of the temporal
 * @returns {ToNativeJsConverter}
 */
export function convert(temporal: LocalDate | LocalDateTime | ZonedDateTime | Instant, zone?: ZoneId): {
    toDate: () => Date;
    toEpochMilli: () => number;
} {
    return new ToNativeJsConverter(temporal, zone);
}
