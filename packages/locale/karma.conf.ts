import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'rollup';
import { configureKarma } from '../../tools/src/build/karma.ts';
import { merge, testGlob } from '../../tools/src/build/rollup.ts';
import { buildRollupConfig } from './rollup-build-packages-config.ts';

const dir = dirname(fileURLToPath(import.meta.url));

const sourceAlias: Plugin = {
    name: 'locale-source-alias',
    resolveId(id: string) {
        return id === '@js-joda/locale'
            ? resolve(dir, 'src/js-joda-locale.js')
            : null;
    },
};

const base = buildRollupConfig({
    locales: ['en', 'en-GB', 'en-CA', 'de', 'fr'],
});

export default configureKarma({
    rollup: merge(base, {
        plugins: [sourceAlias, ...(base.plugins ?? []), testGlob()],
        output: {
            format: 'iife',
            sourcemap: 'inline',
            globals: {
                chai: 'chai',
            },
        },
        external: ['chai'],
    }),
});
