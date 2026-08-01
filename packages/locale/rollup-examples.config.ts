import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import virtual from '@rollup/plugin-virtual';
import type { Plugin, RollupOptions } from 'rollup';
import { mergeConfig } from '../../shared/rollup-config.ts';
import { buildRollupConfig } from './rollup-build-packages-config.ts';
import { plugins } from './rollup.config.ts';
import renderCldrDataLoader from './utils/clrdr-data-render.ts';

const dir = dirname(fileURLToPath(import.meta.url));
const sourceAlias: Plugin = {
    name: 'locale-source-alias',
    resolveId(id: string) {
        return id === '@js-joda/locale'
            ? resolve(dir, 'src/js-joda-locale.js')
            : null;
    },
};

const locales = [
    'de.*', 'en', 'en-US', 'en-GB', 'en-CA', 'es', 'es-ES',
    'fr', 'fr-FR', 'ru', 'ru-RU', 'zh', 'zh-CN', 'hi', 'hi-IN',
] as const;

function exampleConfig(): RollupOptions {
    const data = renderCldrDataLoader(locales);
    const entry = `
import '${resolve(dir, 'src/supplemental-data.js')}';
import 'cldr-data-entry';
export { Locale, WeekFields, registerLocaleData } from '@js-joda/locale';
`;
    const base = buildRollupConfig({ locales });

    return mergeConfig(base, {
        plugins: [
            sourceAlias,
            virtual({
                'example-entry': entry,
                'cldr-data-entry': data,
            }),
            ...(base.plugins ?? []),
        ],
        input: 'example-entry',
        external: ['@js-joda/core', '@js-joda/timezone'],
        output: {
            name: 'JSJodaLocale',
            globals: {
                '@js-joda/core': 'JSJoda',
                '@js-joda/timezone': 'JSJodaTimezone',
            },
        },
    });
}

const config = exampleConfig();
const configs: RollupOptions[] = [
    mergeConfig(config, {
        output: {
            file: 'examples/dist/sample/index.js',
            format: 'umd',
            sourcemap: true,
        },
    }),
    mergeConfig(config, {
        output: {
            file: 'examples/dist/sample/index.esm.js',
            format: 'es',
            sourcemap: true,
        },
    }),
    mergeConfig(config, {
        plugins: [...(config.plugins ?? []), plugins.minify],
        output: {
            file: 'examples/dist/sample/index.min.js',
            format: 'iife',
            sourcemap: false,
        },
    }),
];

export default configs;
