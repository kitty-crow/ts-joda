import { babel } from '@rollup/plugin-babel';
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
    input: './src/js-joda-extra.js',
    plugins: [plugins.babel],
    output: {
        banner: createBanner(pkg),
        name: 'JSJodaExtra',
        globals: {
            '@js-joda/core': 'JSJoda',
        },
    },
    external: ['@js-joda/core'],
} satisfies RollupOptions;

const configs: RollupOptions[] = [
    mergeConfig(defaultConfig, {
        output: {
            file: 'dist/js-joda-extra.esm.js',
            format: 'es',
            sourcemap: true,
        },
    }),
    mergeConfig(defaultConfig, {
        output: {
            file: 'dist/js-joda-extra.js',
            format: 'umd',
            name: 'JSJodaExtra',
            sourcemap: true,
        },
    }),
    mergeConfig(defaultConfig, {
        plugins: [plugins.babel, plugins.minify],
        output: {
            file: 'dist/js-joda-extra.min.js',
            format: 'iife',
            name: 'JSJodaExtra',
            sourcemap: false,
        },
    }),
];

export default configs;
