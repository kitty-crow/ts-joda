import { resolve } from 'node:path';
import commonjsModule from '@rollup/plugin-commonjs';
import jsonPluginModule from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terserModule from '@rollup/plugin-terser';
import {
    type InputOptions,
    type OutputOptions,
    type Plugin,
    rollup,
} from 'rollup';
import {
    packageDir,
    packages,
    root,
    timezoneVariants,
    type PackageConfig,
} from '../config.ts';
import { ensure, json, remove } from '../lib/fs.ts';

// These Rollup plugins expose callable ESM defaults, but their declarations
// currently resolve as CommonJS module objects under TypeScript NodeNext.
interface JsonPluginOptions {
    readonly compact?: boolean;
}

const commonjs = commonjsModule as unknown as () => Plugin;
const jsonPlugin = jsonPluginModule as unknown as (options?: JsonPluginOptions) => Plugin;
const terser = terserModule as unknown as () => Plugin;

interface Manifest {
    readonly name: string;
    readonly version: string;
}

function banner(pkg: PackageConfig): string {
    const manifest = json<Manifest>(resolve(packageDir, pkg.id, 'package.json'));
    return `/*! ${manifest.name} v${manifest.version} | BSD-3-Clause */`;
}

function plugins(extra: readonly Plugin[] = []): Plugin[] {
    return [
        ...extra,
        nodeResolve({ extensions: ['.mjs', '.js', '.json'] }),
        commonjs(),
        jsonPlugin({ compact: true }),
    ];
}

function logOptions(input: InputOptions): InputOptions {
    return {
        ...input,
        onLog(level, log, handler) {
            // The port intentionally preserves js-joda's mutually dependent
            // runtime types. TypeScript also retains a few type-only external
            // imports in compatibility output. Neither diagnostic represents
            // an actionable bundle problem; every other Rollup log is kept.
            if (log.code === 'CIRCULAR_DEPENDENCY' || log.code === 'UNUSED_EXTERNAL_IMPORT') {
                return;
            }
            handler(level, log);
        },
    };
}

async function writeBundle(input: InputOptions, outputs: readonly OutputOptions[]): Promise<void> {
    const bundle = await rollup(logOptions(input));
    try {
        for (const output of outputs) {
            await bundle.write(output);
        }
    } finally {
        await bundle.close();
    }
}

function outputs(pkg: PackageConfig, file = pkg.file): OutputOptions[] {
    const dist = resolve(packageDir, pkg.id, 'dist');
    const common = {
        banner: banner(pkg),
        exports: 'named' as const,
        globals: pkg.globals,
        name: pkg.global,
    };

    return [
        {
            ...common,
            file: resolve(dist, `${file}.js`),
            format: 'umd',
            sourcemap: true,
        },
        {
            ...common,
            file: resolve(dist, `${file}.esm.js`),
            format: 'es',
            sourcemap: true,
        },
        {
            ...common,
            file: resolve(dist, `${file}.min.js`),
            format: 'umd',
            plugins: [terser()],
            sourcemap: false,
        },
    ];
}

async function buildStandard(pkg: PackageConfig): Promise<void> {
    const dist = resolve(packageDir, pkg.id, 'dist');
    remove(dist);
    ensure(dist);
    const entry = resolve(packageDir, pkg.id, 'src', pkg.entry);
    const out = outputs(pkg);
    if (pkg.id === 'core') {
        out.splice(2, 0, {
            banner: banner(pkg),
            exports: 'named',
            file: resolve(dist, 'js-joda.cjs.js'),
            format: 'cjs',
            sourcemap: true,
        });
    }

    await writeBundle({
        external: [...pkg.external],
        input: entry,
        plugins: plugins(),
        treeshake: { moduleSideEffects: true },
    }, out);
}

function timezoneData(suffix: string): Plugin {
    const id = '\0js-joda-timezone-data';
    return {
        name: 'timezone-data',
        resolveId(source: string, importer: string | undefined) {
            if (source === './data/tzdbData.js' && importer?.endsWith('/js-joda-timezone.js') === true) {
                return id;
            }
            return null;
        },
        load(source: string) {
            if (source !== id) {
                return null;
            }
            const file = resolve(root, `src/timezone/data/packed/latest${suffix}.json`);
            return `import data from ${JSON.stringify(file)}; export default data;`;
        },
    };
}

async function buildTimezone(): Promise<void> {
    const pkg = packages.find((item) => item.id === 'timezone');
    if (pkg === undefined) {
        throw new Error('timezone package configuration missing');
    }

    const dist = resolve(packageDir, pkg.id, 'dist');
    remove(dist);
    ensure(dist);

    for (const suffix of timezoneVariants) {
        const empty = suffix === '-empty';
        const entry = resolve(packageDir, 'timezone', 'src', empty
            ? 'js-joda-timezone-empty.js'
            : 'js-joda-timezone.js');
        const extra = empty || suffix === '' ? [] : [timezoneData(suffix)];
        await writeBundle({
            external: [...pkg.external],
            input: entry,
            plugins: plugins(extra),
            treeshake: { moduleSideEffects: true },
        }, outputs(pkg, `${pkg.file}${suffix}`));
    }
}

export async function buildBundles(): Promise<void> {
    for (const pkg of packages) {
        if (pkg.id === 'timezone') {
            await buildTimezone();
        } else {
            await buildStandard(pkg);
        }
    }
}
