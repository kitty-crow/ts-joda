/*
 * @copyright (c) 2016, Philipp Thürwächter & Pattrick Hüper
 * @copyright (c) 2007-present, Stephen Colebourne & Michael Nascimento Santos
 * @license BSD-3-Clause (see LICENSE in the root directory of this source tree)
 */
import { ChronoField } from "./ChronoField.ts";
import { createTemporalQuery } from "./TemporalQuery.ts";
import { TemporalQueries } from "./TemporalQueries.ts";
import { LocalDate } from "../LocalDate.ts";
import { LocalTime } from "../LocalTime.ts";
import { ZoneOffset } from "../ZoneOffset.ts";
import type { ZoneId } from "../ZoneId.ts";
import type { IsoChronology } from "../chrono/IsoChronology.ts";
import type { TemporalUnit } from "./TemporalUnit.ts";
import type { TemporalAccessor } from "./TemporalAccessor.ts";
export function _init(): void {
    //-----------------------------------------------------------------------
    /**
     * A strict query for the {@link ZoneId}.
     */
    TemporalQueries.ZONE_ID = createTemporalQuery<ZoneId | null>('ZONE_ID', (temporal: TemporalAccessor) => {
        return temporal.query(TemporalQueries.ZONE_ID);
    });
    /**
     * A query for the {@link Chronology}.
     */
    TemporalQueries.CHRONO = createTemporalQuery<IsoChronology | null>('CHRONO', (temporal: TemporalAccessor) => {
        return temporal.query(TemporalQueries.CHRONO);
    });
    /**
     * A query for the smallest supported unit.
     */
    TemporalQueries.PRECISION = createTemporalQuery<TemporalUnit | null>('PRECISION', (temporal: TemporalAccessor) => {
        return temporal.query(TemporalQueries.PRECISION);
    });
    //-----------------------------------------------------------------------
    /**
     * A query for {@link ZoneOffset} returning null if not found.
     */
    TemporalQueries.OFFSET = createTemporalQuery<ZoneOffset | null>('OFFSET', (temporal: TemporalAccessor): ZoneOffset | null => {
        if (temporal.isSupported(ChronoField.OFFSET_SECONDS)) {
            return ZoneOffset.ofTotalSeconds(temporal.get(ChronoField.OFFSET_SECONDS));
        }
        return null;
    });
    /**
     * A lenient query for the {@link ZoneId}, falling back to the {@link ZoneOffset}.
     */
    TemporalQueries.ZONE = createTemporalQuery<ZoneId | null>('ZONE', (temporal: TemporalAccessor) => {
        const zone = temporal.query(TemporalQueries.ZONE_ID);
        return (zone != null ? zone : temporal.query(TemporalQueries.OFFSET));
    });
    /**
     * A query for {@link LocalDate} returning null if not found.
     */
    TemporalQueries.LOCAL_DATE = createTemporalQuery<LocalDate | null>('LOCAL_DATE', (temporal: TemporalAccessor): LocalDate | null => {
        if (temporal.isSupported(ChronoField.EPOCH_DAY)) {
            return LocalDate.ofEpochDay(temporal.getLong(ChronoField.EPOCH_DAY));
        }
        return null;
    });
    /**
     * A query for {@link LocalTime} returning null if not found.
     */
    TemporalQueries.LOCAL_TIME = createTemporalQuery<LocalTime | null>('LOCAL_TIME', (temporal: TemporalAccessor): LocalTime | null => {
        if (temporal.isSupported(ChronoField.NANO_OF_DAY)) {
            return LocalTime.ofNanoOfDay(temporal.getLong(ChronoField.NANO_OF_DAY));
        }
        return null;
    });
}
