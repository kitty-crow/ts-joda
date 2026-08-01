import type { RollupOptions } from 'rollup';
import {
    banner,
    libraryBuilds,
    standardPlugins,
} from '../../tools/src/build/rollup.ts';
import pkg from './package.json' with { type: 'json' };

export const plugins = standardPlugins();
export const base = {
    input: './src/js-joda-extra.js',
    plugins: [plugins.babel],
    output: {
        banner: banner(pkg),
        name: 'JSJodaExtra',
        globals: { '@js-joda/core': 'JSJoda' },
    },
    external: ['@js-joda/core'],
} satisfies RollupOptions;

export default libraryBuilds(base, {
    esm: 'dist/js-joda-extra.esm.js',
    umd: 'dist/js-joda-extra.js',
    min: 'dist/js-joda-extra.min.js',
    global: 'JSJodaExtra',
}, plugins.minify);
