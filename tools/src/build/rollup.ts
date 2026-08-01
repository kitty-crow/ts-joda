import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { babel } from '@rollup/plugin-babel';
import { sync as glob } from 'glob';
import type { OutputOptions, Plugin, RollupOptions } from 'rollup';
import { terser } from 'rollup-plugin-minification';

export interface PackageIdentity {
    readonly name: string;
    readonly version: string;
}

export interface StandardPlugins {
    readonly babel: Plugin;
    readonly minify: Plugin;
}

export interface LibraryOutputs {
    readonly esm?: string;
    readonly cjs?: string;
    readonly umd?: string;
    readonly min?: string;
    readonly global: string;
}

const dir = dirname(fileURLToPath(import.meta.url));
const preamble = readFileSync(resolve(dir, '../../../shared/license-preamble.txt'), 'utf8');

export function banner(pkg: PackageIdentity): string {
    return `//! @version ${pkg.name} - ${pkg.version}\n${preamble}`;
}

export function standardPlugins(): StandardPlugins {
    return {
        babel: babel({ babelHelpers: 'bundled' }),
        minify: terser({ output: { comments: /^!/u } }),
    };
}

function mergeOutput(base: OutputOptions, patch: OutputOptions): OutputOptions {
    const globals = patch.globals === undefined
        ? base.globals
        : { ...base.globals, ...patch.globals };
    const merged = { ...base, ...patch };
    return globals === undefined ? merged : { ...merged, globals };
}

function isOutputList(value: RollupOptions['output']): value is readonly OutputOptions[] {
    return Array.isArray(value);
}

function output(base: RollupOptions['output'], patch: RollupOptions['output']): RollupOptions['output'] {
    if (patch === undefined) {
        return base;
    }
    if (base === undefined || isOutputList(base) || isOutputList(patch)) {
        return patch;
    }
    return mergeOutput(base, patch);
}

export function merge(base: RollupOptions, patch: RollupOptions): RollupOptions {
    const mergedOutput = output(base.output, patch.output);
    const merged = { ...base, ...patch };
    return mergedOutput === undefined ? merged : { ...merged, output: mergedOutput };
}

type OutputFormat = NonNullable<OutputOptions['format']>;

function build(base: RollupOptions, file: string, format: OutputFormat, global: string): RollupOptions {
    return merge(base, {
        output: {
            file,
            format,
            name: global,
            sourcemap: true,
        },
    });
}

export function libraryBuilds(
    base: RollupOptions,
    files: LibraryOutputs,
    minify: Plugin,
): RollupOptions[] {
    const builds: RollupOptions[] = [];

    if (files.esm !== undefined) {
        builds.push(build(base, files.esm, 'es', files.global));
    }
    if (files.cjs !== undefined) {
        builds.push(build(base, files.cjs, 'cjs', files.global));
    }
    if (files.umd !== undefined) {
        builds.push(build(base, files.umd, 'umd', files.global));
    }
    if (files.min !== undefined) {
        builds.push(merge(base, {
            plugins: [...(base.plugins ?? []), minify],
            output: {
                file: files.min,
                format: 'iife',
                name: files.global,
                sourcemap: false,
            },
        }));
    }

    return builds;
}

export function testGlob(): Plugin {
    return {
        name: 'test-glob',
        resolveId(id: string): string | null {
            return id.startsWith('**') ? id : null;
        },
        load(id: string): string | null {
            if (!id.startsWith('**')) {
                return null;
            }

            return glob(id, { cwd: process.cwd() })
                .map((file, index) => {
                    const path = join(process.cwd(), file);
                    return `import _${index} from ${JSON.stringify(path)}; export { _${index} };`;
                })
                .join('\n');
        },
    };
}
