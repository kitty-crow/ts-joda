import { babel } from '@rollup/plugin-babel';
import type { Plugin, RollupOptions, OutputOptions } from 'rollup';
import { terser } from 'rollup-plugin-minification';
import { createBanner } from '../../shared/rollup-utils.ts';
import pkg from './package.json' with { type: 'json' };

export const plugins = {
    babel: babel({ babelHelpers: 'bundled' }),
    minify: terser({ output: { comments: /^!/u } }),
} satisfies Record<string, Plugin>;

export const defaultConfig = {
    input: './src/js-joda.js',
    plugins: [plugins.babel],
    output: {
        banner: createBanner(pkg),
        name: 'JSJoda',
    },
} satisfies RollupOptions;

function config(output: OutputOptions, extra: readonly Plugin[] = []): RollupOptions {
    return {
        ...defaultConfig,
        plugins: [...(defaultConfig.plugins ?? []), ...extra],
        output: {
            ...defaultConfig.output,
            ...output,
        },
    };
}

const configs: RollupOptions[] = [
    config({
        file: 'dist/js-joda.esm.js',
        format: 'es',
        sourcemap: true,
    }),
    config({
        file: 'dist/js-joda.cjs.js',
        format: 'cjs',
        sourcemap: true,
    }),
    config({
        file: 'dist/js-joda.js',
        format: 'umd',
        name: 'JSJoda',
        sourcemap: true,
    }),
    config({
        file: 'dist/js-joda.min.js',
        format: 'iife',
        name: 'JSJoda',
        sourcemap: false,
    }, [plugins.minify]),
];

export default configs;
