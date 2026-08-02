import type { ZonedDateTime } from "./ZonedDateTime.ts";
/*
 * @copyright (c) 2015-present, Philipp Thürwächter, Pattrick Hüper & js-joda contributors
 * @license BSD-3-Clause (see LICENSE in the root directory of this source tree)
 */
import { requireNonNull } from "./assert.ts";
import { Instant, ZoneId } from "./js-joda.ts";
/**
 * Creates ZonedDateTime from a javascript Date or a moment instance.
 * @param {string} date - a javascript Date or a moment instance
 * @param {ZoneId} [zone = ZoneId.systemDefault()] - the zone of the returned ZonedDateTime, defaults to ZoneId.systemDefault()
 * @returns {ZonedDateTime}
 */
export function nativeJs(date: Date, zone: ZoneId = ZoneId.systemDefault()): ZonedDateTime {
    requireNonNull(date, 'date');
    requireNonNull(zone, 'zone');
    return Instant.ofEpochMilli(date.valueOf()).atZone(zone);
}
