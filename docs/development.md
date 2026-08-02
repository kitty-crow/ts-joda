# Development

## Layout

```text
src/
  core/
  extra/
  timezone/
  locale/
  tools/
docs/
packages/
  core/package.json
  extra/package.json
  timezone/package.json
  locale/package.json
```

Only `src/` contains maintained implementation code. Only `docs/` contains maintained documentation. `packages/` contains thin publication metadata; build outputs are transient.

## Commands

```sh
npm install
npm run typecheck
npm run build
npm run check
npm run audit
```

- `typecheck` checks all maintained packages with strict TypeScript.
- `build` emits deep-import JavaScript and declarations, then creates UMD, ESM, CommonJS, minified, timezone-variant and prebuilt-locale distributions.
- `check` combines type checking, build and compatibility smoke checks.
- `build:ts-node` runs the TypeScript build tool through `ts-node`.
- `build:bun` runs the same build tool with Bun.

## Generated files

Never edit package `dist/`, generated package `src/`, `typings/` or generated locale package directories. Change the canonical TypeScript source or build tool instead.

## Adding source

Place implementation under the relevant `src/<package>/` concern folder. Use explicit `.ts` extensions for relative imports. Keep public exports in the package entry module and document consumer-facing additions in the matching Markdown guide.
