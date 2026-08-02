import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import type { RollupOptions } from 'rollup';
import {
    banner,
    merge,
    standardPlugins,
} from '../../tools/src/build/rollup.ts';
import pkg from './package.json' with { type: 'json' };

export const plugins = standardPlugins();

export const defaultConfig = {
    input: './src/js-joda-locale.js',
    plugins: [nodeResolve(), commonjs(), json(), plugins.babel],
    output: {
        banner: banner(pkg),
        globals: {
            '@js-joda/core': 'JSJoda',
            '@js-joda/timezone': 'JSJodaTimezone',
            'cldr-data': 'cldr-data',
        },
    },
    external: ['@js-joda/core', '@js-joda/timezone', 'cldr-data'],
} satisfies RollupOptions;

const configs: RollupOptions[] = [
    merge(defaultConfig, {
        output: {
            file: 'dist/js-joda-locale.esm.js',
            format: 'es',
            sourcemap: true,
        },
    }),
    merge(defaultConfig, {
        output: {
            file: 'dist/js-joda-locale.js',
            format: 'umd',
            name: 'JSJodaLocale',
            sourcemap: true,
        },
    }),
    merge(defaultConfig, {
        plugins: [nodeResolve(), commonjs(), json(), plugins.babel, plugins.minify],
        output: {
            file: 'dist/js-joda-locale.min.js',
            format: 'iife',
            name: 'JSJodaLocale',
        },
    }),
];

export default configs;
