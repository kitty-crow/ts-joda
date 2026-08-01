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

`compat/api-baseline.lock.json` freezes the pre-refactor package metadata and declaration files.

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

## Migration order

1. Lock package metadata, declarations and distribution entry points.
2. Convert repository tooling and build configuration.
3. Convert `@js-joda/core` source and tests.
4. Convert timezone, locale and extra packages.
5. Convert examples and generated-package tooling.
6. Enable the zero-JavaScript CI gate.
7. Run full build, Node, browser, declaration and integration parity checks.
8. Apply the major-version increase, squash the branch and fast-forward `main`.
