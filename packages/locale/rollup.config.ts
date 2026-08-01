import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import type { Plugin, RollupOptions } from 'rollup';
import { terser } from 'rollup-plugin-minification';
import { mergeConfig } from '../../shared/rollup-config.ts';
import { createBanner } from '../../shared/rollup-utils.ts';
import pkg from './package.json' with { type: 'json' };

export const plugins = {
    babel: babel({ babelHelpers: 'bundled' }),
    minify: terser({ output: { comments: /^!/u } }),
} satisfies Record<string, Plugin>;

export const defaultConfig = {
    input: './src/js-joda-locale.js',
    plugins: [nodeResolve(), commonjs(), json(), plugins.babel],
    output: {
        banner: createBanner(pkg),
        globals: {
            '@js-joda/core': 'JSJoda',
            '@js-joda/timezone': 'JSJodaTimezone',
            'cldr-data': 'cldr-data',
        },
    },
    external: ['@js-joda/core', '@js-joda/timezone', 'cldr-data'],
} satisfies RollupOptions;

const configs: RollupOptions[] = [
    mergeConfig(defaultConfig, {
        output: {
            file: 'dist/js-joda-locale.esm.js',
            format: 'es',
            sourcemap: true,
        },
    }),
    mergeConfig(defaultConfig, {
        output: {
            file: 'dist/js-joda-locale.js',
            format: 'umd',
            name: 'JSJodaLocale',
            sourcemap: true,
        },
    }),
    mergeConfig(defaultConfig, {
        plugins: [nodeResolve(), commonjs(), json(), plugins.babel, plugins.minify],
        output: {
            file: 'dist/js-joda-locale.min.js',
            format: 'iife',
            name: 'JSJodaLocale',
        },
    }),
];

export default configs;
