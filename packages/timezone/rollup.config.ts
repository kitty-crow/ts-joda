import { readdirSync } from 'node:fs';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import type { Plugin, RollupOptions } from 'rollup';
import {
    banner as packageBanner,
    merge,
    standardPlugins,
} from '../../tools/src/build/rollup.ts';
import tzdb from './data/unpacked/latest.json' with { type: 'json' };
import pkg from './package.json' with { type: 'json' };

function empty(suffix: string): boolean {
    return suffix === '-empty';
}

function buildBanner(suffix = ''): string {
    const version = empty(suffix)
        ? pkg.version
        : `${pkg.version}-${tzdb.version}${suffix}`;
    return packageBanner({ name: pkg.name, version });
}

const standard = standardPlugins();

export const plugins = {
    ...standard,
    json: json(),
    replace(suffix: string): Plugin {
        return replace({
            'data/packed/latest.json': `data/packed/latest${suffix}.json`,
            preventAssignment: true,
        });
    },
};

function input(suffix: string): string {
    return `./src/js-joda-timezone${empty(suffix) ? '-empty' : ''}.js`;
}

function base(suffix: string): RollupOptions {
    return {
        input: input(suffix),
        plugins: [plugins.replace(suffix), plugins.babel, plugins.json],
        output: {
            banner: buildBanner(suffix),
            name: 'JSJodaTimezone',
            globals: {
                '@js-joda/core': 'JSJoda',
            },
        },
        external: ['@js-joda/core'],
    };
}

function builds(suffix: string): RollupOptions[] {
    const config = base(suffix);
    return [
        merge(config, {
            output: {
                file: `dist/js-joda-timezone${suffix}.js`,
                format: 'umd',
                sourcemap: true,
            },
        }),
        merge(config, {
            output: {
                file: `dist/js-joda-timezone${suffix}.esm.js`,
                format: 'es',
                sourcemap: true,
            },
        }),
        merge(config, {
            plugins: [...(config.plugins ?? []), plugins.minify],
            output: {
                file: `dist/js-joda-timezone${suffix}.min.js`,
                format: 'iife',
                sourcemap: false,
            },
        }),
    ];
}

const pattern = /^latest(.*)\.json$/u;
const suffixes = readdirSync('./data/packed')
    .map((name) => name.match(pattern)?.[1])
    .filter((suffix): suffix is string => suffix !== undefined)
    .concat('-empty');

export default suffixes.flatMap(builds);
