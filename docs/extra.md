# Extra

`@js-joda/extra` adds focused types that remain compatible with the core temporal contracts.

```sh
npm install @js-joda/core @js-joda/extra
```

```ts
import { LocalDate } from '@js-joda/core';
import { Interval, LocalDateRange, YearQuarter } from '@js-joda/extra';
```

## Types

- `Interval` models a half-open interval between two instants.
- `LocalDateRange` models a range of local dates.
- `YearQuarter` and `Quarter` model quarter-based dates.
- `YearWeek` models ISO week-based years.
- `DayOfMonth` and `DayOfYear` provide reusable adjusters.
- `OffsetDate` combines a local date with a fixed offset.
- `Temporals` contains additional conversion and adjustment helpers.

The package registers its plug-in when imported. Use the same `@js-joda/core` installation across all js-joda packages.
