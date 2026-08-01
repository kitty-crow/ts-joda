import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import virtual from '@rollup/plugin-virtual';
import type { RollupOptions } from 'rollup';
import { merge as mergeConfig } from '../../tools/src/build/rollup.ts';
import { defaultConfig, plugins } from './rollup.config.ts';
import renderCldrDataLoader from './utils/clrdr-data-render.ts';

export type LocalePackages = Readonly<Record<string, readonly string[]>>;

export interface LocaleBuild {
    readonly destDir: string;
    readonly packages: LocalePackages;
}

export function buildRollupConfig(options: { readonly locales: readonly string[] }): RollupOptions {
    const source = renderCldrDataLoader(options.locales);
    return mergeConfig(defaultConfig, {
        plugins: [
            plugins.babel,
            virtual({ 'cldr-entry': source }),
            json(),
            nodeResolve(),
            commonjs(),
        ],
        input: 'cldr-entry',
        output: {
            name: 'JSJodaLocale',
            globals: {
                '@js-joda/core': 'JSJoda',
                '@js-joda/timezone': 'JSJodaTimezone',
                '@js-joda/locale': 'JSJodaLocale',
            },
        },
        external: ['@js-joda/core', '@js-joda/timezone', '@js-joda/locale'],
    });
}

export function buildRollupConfigs(options: LocaleBuild): RollupOptions[] {
    return Object.entries(options.packages).flatMap(([name, locales]) => {
        const config = buildRollupConfig({ locales });
        return [
            mergeConfig(config, {
                output: {
                    file: `${options.destDir}/${name}/index.js`,
                    format: 'umd',
                    sourcemap: true,
                },
            }),
            mergeConfig(config, {
                output: {
                    file: `${options.destDir}/${name}/index.esm.js`,
                    format: 'es',
                    sourcemap: true,
                },
            }),
            mergeConfig(config, {
                plugins: [...(config.plugins ?? []), plugins.minify],
                output: {
                    file: `${options.destDir}/${name}/index.min.js`,
                    format: 'iife',
                    sourcemap: false,
                },
            }),
        ];
    });
}
