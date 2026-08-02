/*
 * @copyright (c) 2016, Philipp Thürwächter & Pattrick Hüper
 * @license BSD-3-Clause (see LICENSE in the root directory of this source tree)
 */
import { _init as ZoneOffsetInit } from "./ZoneOffset.ts";
import { _init as DayOfWeekInit } from "./DayOfWeek.ts";
import { _init as DurationInit } from "./Duration.ts";
import { _init as InstantInit } from "./Instant.ts";
import { _init as LocalDateInit } from "./LocalDate.ts";
import { _init as LocalTimeInit } from "./LocalTime.ts";
import { _init as LocalDateTimeInit } from "./LocalDateTime.ts";
import { _init as MonthInit } from "./Month.ts";
import { _init as MonthDayInit } from "./MonthDay.ts";
import { _init as OffsetDateTimeInit } from "./OffsetDateTime.ts";
import { _init as OffsetTimeInit } from "./OffsetTime.ts";
import { _init as PeriodInit } from "./Period.ts";
import { _init as YearInit } from "./Year.ts";
import { _init as YearConstantsInit } from "./YearConstants.ts";
import { _init as YearMonthInit } from "./YearMonth.ts";
import { _init as ZonedDateTimeInit } from "./ZonedDateTime.ts";
import { _init as IsoChronologyInit } from "./chrono/IsoChronology.ts";
import { _init as DateTimeFormatterInit } from "./format/DateTimeFormatter.ts";
import { _init as ChronoFieldInit } from "./temporal/ChronoField.ts";
import { _init as ChronoUnitInit } from "./temporal/ChronoUnit.ts";
import { _init as IsoFieldsInit } from "./temporal/IsoFields.ts";
import { _init as DateTimeFormatterBuilderInit } from "./format/DateTimeFormatterBuilder.ts";
import { _init as TemporalQueriesInit } from "./temporal/TemporalQueriesFactory.ts";
import { _init as ZoneIdInit } from "./ZoneIdFactory.ts";
let isInit = false;
function init(): void {
    if (isInit) {
        return;
    }
    isInit = true;
    YearConstantsInit();
    DurationInit();
    ChronoUnitInit();
    ChronoFieldInit();
    LocalTimeInit();
    IsoFieldsInit();
    TemporalQueriesInit();
    DayOfWeekInit();
    InstantInit();
    LocalDateInit();
    LocalDateTimeInit();
    YearInit();
    MonthInit();
    YearMonthInit();
    MonthDayInit();
    PeriodInit();
    ZoneOffsetInit();
    ZonedDateTimeInit();
    ZoneIdInit();
    IsoChronologyInit();
    DateTimeFormatterInit();
    DateTimeFormatterBuilderInit();
    OffsetDateTimeInit();
    OffsetTimeInit();
}
init();
