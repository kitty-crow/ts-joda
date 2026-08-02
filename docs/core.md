# Core

`@js-joda/core` provides immutable date-time values, temporal fields and units, formatting, parsing and zone abstractions.

## Main value types

- `LocalDate`, `LocalTime` and `LocalDateTime` represent local calendar values without an offset.
- `Instant` represents a point on the UTC timeline.
- `ZoneOffset`, `OffsetTime` and `OffsetDateTime` attach a fixed offset.
- `ZoneId` and `ZonedDateTime` apply timezone rules.
- `Duration` stores seconds and nanoseconds.
- `Period` stores date-based years, months and days.
- `Year`, `YearMonth`, `MonthDay`, `Month` and `DayOfWeek` model focused calendar concepts.

## Arithmetic

Use type-specific methods for clear intent:

```ts
import { LocalDate, ChronoUnit } from '@js-joda/core';

const start = LocalDate.of(2026, 8, 2);
const end = start.plusMonths(1).withDayOfMonth(1);
const days = start.until(end, ChronoUnit.DAYS);
```

Invalid dates, unsupported fields and arithmetic overflow throw the exported js-joda exception types.

## Formatting

`DateTimeFormatter` supplies ISO formatters and pattern-based formatting. `DateTimeFormatterBuilder` supports optional sections, reduced values, fractions, offsets, zones and custom text maps.

## Temporal API

`Temporal`, `TemporalAccessor`, `TemporalField`, `TemporalUnit`, `TemporalAdjuster`, `TemporalQuery`, `ChronoField`, `ChronoUnit`, `IsoFields`, `TemporalAdjusters` and `TemporalQueries` form the extensible temporal layer used by the core and plug-in packages.

## Zones

Core includes fixed offsets and the zone provider abstraction. Install `@js-joda/timezone` for IANA region rules such as `Europe/London`.
