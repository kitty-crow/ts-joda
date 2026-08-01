# Strict TypeScript refactor

This directory records the compatibility boundary for the TypeScript migration.
It is intentionally separate from the project README, which remains focused on using js-joda.

## Hard requirements

- Maintained source, tests and tooling must contain no `.js`, `.jsx`, `.cjs` or `.mjs` files.
- TypeScript must compile with strict checking. Broad `any`, unchecked casts and `@ts-ignore` are not migration strategies.
- Existing package names, entry points, browser globals, CommonJS and ESM outputs must remain available.
- Existing exported names, call signatures, return shapes and runtime behaviour must remain compatible.
- Generated locale packages and distribution JavaScript are build artefacts, not maintained source.
- Internal names may be shortened only when they are not part of the public API.
- The final repository change is one squashed refactor commit and one major-version increase per published package.

## Compatibility gates

`compat/api-baseline.lock.json` freezes the pre-refactor package metadata, declaration files, command names and historical published source paths.

```sh
npm run typecheck:tools
npm run check:api
npm run check:no-js
```

`check:no-js` is expected to fail until the final migration stage. It becomes a required CI gate once every maintained JavaScript-family file has been converted or removed.

The complete parity gate remains the existing monorepo pipeline:

```sh
npx lerna run --stream build-dist
npx lerna run --stream build-locale-dist
npx lerna run --stream test
npx lerna run --stream test-ts-definitions
cd packages/examples && npm test
```

## Completed milestones

### Repository tooling

Repository and package tooling now has one implementation home under `tools/src`. Package-root Rollup and Karma files are thin declarative adapters. Compatibility capture, auditing, package-source generation and build helpers are split by responsibility rather than duplicated across packages.

### `@js-joda/timezone`

The maintained runtime is strict TypeScript, organised into data, rules and plugin responsibilities under `src/`. Flat TypeScript facades retain the historical source layout, while package preparation emits the original `.js` deep-import paths and removes them again after packing.

Behavioural parity was checked against the pre-refactor implementation across all 597 zone IDs and 723,846 offset, transition and local-date-time cases. The original package manifest, declarations, bundle entry points and nine historical flat source paths remain compatibility requirements.

## Migration order

1. Lock package metadata, declarations, commands and published source paths.
2. Consolidate repository tooling and build configuration.
3. Convert timezone, extra and locale packages with package-source compatibility bridges.
4. Convert `@js-joda/core` source and tests.
5. Convert examples and remaining tests or generated-package tooling.
6. Enable the zero-JavaScript CI gate.
7. Run full build, Node, browser, declaration, package and integration parity checks.
8. Apply the major-version increases, squash the branch and fast-forward `main`.
