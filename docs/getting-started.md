# Getting started

## Install

Install only the packages your application uses:

```sh
npm install @js-joda/core
npm install @js-joda/extra
npm install @js-joda/timezone
npm install @js-joda/locale cldrjs cldr-data
```

`@js-joda/extra`, `@js-joda/timezone` and `@js-joda/locale` plug into the same `@js-joda/core` instance. Keep one compatible core version in the dependency graph.

## Dates and times

```ts
import { LocalDate, LocalDateTime, LocalTime } from '@js-joda/core';

const date = LocalDate.of(2026, 8, 2);
const time = LocalTime.of(18, 30);
const dateTime = LocalDateTime.of(date, time);
```

The value types are immutable. Arithmetic returns a new value:

```ts
const tomorrow = date.plusDays(1);
```

## Parsing and formatting

```ts
import { DateTimeFormatter, LocalDate } from '@js-joda/core';

const format = DateTimeFormatter.ofPattern('yyyy-MM-dd');
const date = LocalDate.parse('2026-08-02', format);
const text = date.format(format);
```

## Native `Date`

Use `nativeJs` and `convert` when crossing the JavaScript `Date` boundary. Keep domain calculations in js-joda types so the zone and calendar rules stay explicit.

## Direct TypeScript source

The repository source uses explicit `.ts` imports:

```sh
node --loader ts-node/esm app.ts
bun app.ts
```

Published npm packages include generated JavaScript and declarations, so consumers do not need a TypeScript runtime.
