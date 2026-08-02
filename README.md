# ts-joda

A strict TypeScript refactor of js-joda with the original package and entry-point surface preserved.

The maintained implementation lives entirely in [`src/`](src). Detailed usage and development notes live in [`docs/`](docs/README.md). JavaScript distributions, declaration files and historical deep-import paths are generated for publishing and are not committed.

## Packages

| Package | Purpose |
| --- | --- |
| [`@js-joda/core`](docs/core.md) | Immutable date, time, duration, period and formatting types |
| [`@js-joda/extra`](docs/extra.md) | Intervals, ranges, quarters, week years and additional adjusters |
| [`@js-joda/timezone`](docs/timezone.md) | IANA timezone rules and compact data variants |
| [`@js-joda/locale`](docs/locale.md) | CLDR-backed locale formatting and prebuilt locale packages |

## Install

```sh
npm install @js-joda/core
```

```ts
import { LocalDate, Period } from '@js-joda/core';

const release = LocalDate.parse('2026-08-02');
const review = release.plus(Period.ofWeeks(2));
```

The source uses explicit `.ts` imports and runs directly with `ts-node` and Bun. Published packages retain the original UMD, ESM, CommonJS, declaration and deep-import surfaces.

## Development

```sh
npm install
npm run check
```

`npm run check` performs strict type checking, builds all compatibility outputs and runs package, timezone, locale, deep-import and `ts-node` smoke checks.

## Documentation

Start with [Getting started](docs/getting-started.md), then use the package guides above. Compatibility guarantees and generated paths are documented in [Compatibility](docs/compatibility.md). Repository structure and build commands are documented in [Development](docs/development.md).

## Licence

BSD-3-Clause. See [`LICENSE`](LICENSE).
