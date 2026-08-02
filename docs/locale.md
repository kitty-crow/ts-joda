# Locale

`@js-joda/locale` adds CLDR-backed text, patterns, week rules and zone names.

```sh
npm install @js-joda/core @js-joda/locale cldrjs cldr-data
```

```ts
import { DateTimeFormatter, LocalDate } from '@js-joda/core';
import { Locale } from '@js-joda/locale';

const format = DateTimeFormatter.ofPattern('d MMMM uuuu').withLocale(Locale.ENGLISH);
const text = LocalDate.of(2026, 8, 2).format(format);
```

Import `@js-joda/timezone` as well when formatting region-zone names.

## Prebuilt locale packages

The build generates the historical `@js-joda/locale_<name>` packages, including `locale_en-us`, `locale_en-gb`, `locale_de`, `locale_es`, `locale_fr`, `locale_ja`, `locale_ko`, `locale_zh` and the other existing locale groups. A prebuilt package registers only its bundled locale data and avoids requiring the complete `cldr-data` package at runtime.

```ts
import '@js-joda/locale_en-us';
```

## Custom data

Use `registerLocaleData(path, data)` to register CLDR Gregorian calendar and timezone-name documents supplied by the application.
