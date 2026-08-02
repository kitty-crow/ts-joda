# Timezone

`@js-joda/timezone` registers IANA timezone rules with `@js-joda/core`.

```sh
npm install @js-joda/core @js-joda/timezone
```

```ts
import { LocalDateTime, ZoneId, ZonedDateTime } from '@js-joda/core';
import '@js-joda/timezone';

const local = LocalDateTime.parse('2026-08-02T18:30');
const london = ZonedDateTime.of(local, ZoneId.of('Europe/London'));
```

## Data builds

The default build contains the complete current packed database. Historical compact filenames remain generated:

- `js-joda-timezone-10-year-range`
- `js-joda-timezone-1970-2030`
- `js-joda-timezone-2012-2022`
- `js-joda-timezone-2017-2027`
- `js-joda-timezone-empty`

Use the empty build when the host application supplies its own zone rules. Range-limited builds reduce size but must not be used outside their covered years.

## Gaps and overlaps

A spring transition can create a local-time gap. An autumn transition can create an overlap with two valid offsets. `ZonedDateTime` and `ZoneRules` expose the transition and valid-offset behaviour rather than silently treating local time as UTC.
