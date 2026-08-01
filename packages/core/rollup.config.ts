import type { RollupOptions } from 'rollup';
import {
    banner,
    libraryBuilds,
    standardPlugins,
} from '../../tools/src/build/rollup.ts';
import pkg from './package.json' with { type: 'json' };

export const plugins = standardPlugins();
export const base = {
    input: './src/js-joda.js',
    plugins: [plugins.babel],
    output: {
        banner: banner(pkg),
        name: 'JSJoda',
    },
} satisfies RollupOptions;

export default libraryBuilds(base, {
    esm: 'dist/js-joda.esm.js',
    cjs: 'dist/js-joda.cjs.js',
    umd: 'dist/js-joda.js',
    min: 'dist/js-joda.min.js',
    global: 'JSJoda',
}, plugins.minify);
