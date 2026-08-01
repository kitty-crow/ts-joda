import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Config, ConfigOptions } from 'karma';
import type { Plugin } from 'rollup';
import { mergeConfig } from '../../shared/rollup-config.ts';
import testGlob from '../../shared/rollup-test-glob.ts';
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
const rollupConfig = mergeConfig(base, {
    plugins: [sourceAlias, ...(base.plugins ?? []), testGlob()],
    output: {
        format: 'iife',
        sourcemap: 'inline',
        globals: {
            chai: 'chai',
        },
    },
    external: ['chai'],
});

export default function configure(config: Config): void {
    const options: ConfigOptions = {
        files: [{ pattern: 'test/rollup-index.js' }],
        frameworks: ['mocha', 'chai'],
        preprocessors: {
            'test/rollup-index.js': ['rollup'],
        },
        rollupPreprocessor: rollupConfig,
        browserDisconnectTimeout: 10_000,
        browserNoActivityTimeout: 4 * 60 * 1_000,
        captureTimeout: 4 * 60 * 1_000,
        reporters: ['progress'],
        browsers: ['ChromeHeadless', 'FirefoxHeadless'],
        plugins: ['karma-*'],
    };

    config.set(options);
}
