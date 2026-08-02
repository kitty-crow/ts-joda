# Compatibility

The refactor changes repository organisation and implementation language, not the consumer-facing package contract.

## Preserved

- Package names for core, extra, timezone, locale and prebuilt locale packages.
- Root exports and exported symbol names.
- UMD package entry files used by `main`.
- ESM files used by `module`.
- Core CommonJS compatibility output.
- Minified browser globals: `JSJoda`, `JSJodaExtra`, `JSJodaTimezone` and `JSJodaLocale`.
- Declaration entry files under `typings/`.
- Published `src/` deep-import paths, generated from the strict TypeScript source.
- Timezone range and empty distribution filenames.
- Plug-in registration behaviour and runtime value shapes.

## Repository versus package layout

The repository has one canonical source tree at `src/`. Package-local `src/`, `dist/`, `typings/`, README and licence files are generated during `npm run build` and ignored by Git. This keeps development organised without removing historical npm paths.

## Version

This refactor is a major release for each independently versioned package: `@js-joda/core` 7.0.0, `@js-joda/extra` 1.0.0, `@js-joda/locale` and its generated locale packages 6.0.0, and `@js-joda/timezone` 3.0.0. Future landmarks increment each package from its own release line.
