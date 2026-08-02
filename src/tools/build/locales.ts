import { createRequire } from 'node:module';
import { readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import commonjsModule from '@rollup/plugin-commonjs';
import jsonPluginModule from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terserModule from '@rollup/plugin-terser';
import { rollup, type OutputOptions, type Plugin } from 'rollup';
import { buildDir, localePackages, packageDir, root } from '../config.ts';
import { copy, ensure, remove, write, writeJson } from '../lib/fs.ts';

const require = createRequire(import.meta.url);

// These Rollup plugins expose callable ESM defaults, but their declarations
// currently resolve as CommonJS module objects under TypeScript NodeNext.
interface JsonPluginOptions {
    readonly compact?: boolean;
}

const commonjs = commonjsModule as unknown as () => Plugin;
const jsonPlugin = jsonPluginModule as unknown as (options?: JsonPluginOptions) => Plugin;
const terser = terserModule as unknown as () => Plugin;

function availableLocales(): string[] {
    const manifest = require.resolve('cldr-dates-full/package.json');
    return readdirSync(resolve(dirname(manifest), 'main'), { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name);
}

function expand(patterns: readonly string[], available: readonly string[]): string[] {
    return [...new Set(patterns.flatMap((pattern) => {
        const match = new RegExp(`^${pattern}$`, 'u');
        return available.filter((locale) => match.test(locale));
    }))];
}

interface LocaleSource {
    readonly locale: string;
    readonly source: string;
}

function source(locales: readonly LocaleSource[]): string {
    const imports: string[] = ["import { registerLocaleData } from '@js-joda/locale';"];
    const calls: string[] = [];
    for (const [index, item] of locales.entries()) {
        imports.push(`import calendar${index} from 'cldr-dates-full/main/${item.source}/ca-gregorian.json';`);
        imports.push(`import zones${index} from 'cldr-dates-full/main/${item.source}/timeZoneNames.json';`);
        if (item.locale === item.source) {
            calls.push(`registerLocaleData('main/${item.locale}/ca-gregorian.json', calendar${index});`);
            calls.push(`registerLocaleData('main/${item.locale}/timeZoneNames.json', zones${index});`);
            continue;
        }
        const locale = JSON.stringify(item.locale);
        const origin = JSON.stringify(item.source);
        calls.push(`registerLocaleData('main/${item.locale}/ca-gregorian.json', { main: { [${locale}]: calendar${index}.main[${origin}] } });`);
        calls.push(`registerLocaleData('main/${item.locale}/timeZoneNames.json', { main: { [${locale}]: zones${index}.main[${origin}] } });`);
    }
    return `${imports.join('\n')}\n\n${calls.join('\n')}\n`;
}

function manifest(name: string, locales: readonly string[]): unknown {
    return {
        name: `@js-joda/locale_${name}`,
        version: '6.0.0',
        description: `Prebuilt js-joda locale data for ${locales.join(', ')}`,
        main: 'dist/index.js',
        module: 'dist/index.esm.js',
        files: ['dist', 'README.md', 'LICENSE'],
        sideEffects: true,
        keywords: ['date', 'time', 'locale', 'cldr'],
        license: 'BSD-3-Clause',
        repository: { type: 'git', url: 'git+https://github.com/kitty-crow/ts-joda.git' },
        peerDependencies: {
            '@js-joda/core': '>=6.0.0',
            '@js-joda/locale': '>=6.0.0',
            '@js-joda/timezone': '^2.25.0 || ^3.0.0',
        },
        peerDependenciesMeta: {
            '@js-joda/timezone': { optional: true },
        },
        publishConfig: { access: 'public' },
    };
}

function outputs(dir: string): OutputOptions[] {
    const common = {
        exports: 'named' as const,
        globals: {
            '@js-joda/core': 'JSJoda',
            '@js-joda/locale': 'JSJodaLocale',
            '@js-joda/timezone': 'JSJodaTimezone',
        },
        name: 'JSJodaLocale',
    };
    return [
        { ...common, file: resolve(dir, 'index.js'), format: 'umd', sourcemap: true },
        { ...common, file: resolve(dir, 'index.esm.js'), format: 'es', sourcemap: true },
        { ...common, file: resolve(dir, 'index.min.js'), format: 'umd', plugins: [terser()] },
    ];
}

export async function buildLocales(): Promise<void> {
    const outputRoot = resolve(packageDir, 'locales');
    const sourceRoot = resolve(buildDir, 'locales');
    remove(outputRoot);
    remove(sourceRoot);
    ensure(sourceRoot);
    const available = availableLocales();

    for (const [name, patterns] of Object.entries(localePackages)) {
        const sources: LocaleSource[] = name === 'no'
            ? [
                { locale: 'no', source: 'nb' },
                { locale: 'no-NO', source: 'nb-NO' },
            ].filter((item) => available.includes(item.source))
            : expand(patterns, available).map((locale) => ({ locale, source: locale }));
        const locales = sources.map((item) => item.locale);
        if (locales.length === 0) {
            throw new Error(`No CLDR locales matched ${name}: ${patterns.join(', ')}`);
        }

        const input = resolve(sourceRoot, `${name}.js`);
        write(input, source(sources));
        const dir = resolve(outputRoot, name);
        const dist = resolve(dir, 'dist');
        ensure(dist);
        writeJson(resolve(dir, 'package.json'), manifest(name, locales));
        write(resolve(dir, 'README.md'), `# @js-joda/locale_${name}\n\nPrebuilt locale data for ${locales.join(', ')}. See the repository locale guide for usage.\n`);
        copy(resolve(root, 'LICENSE'), resolve(dir, 'LICENSE'));

        const bundle = await rollup({
            external: ['@js-joda/core', '@js-joda/locale', '@js-joda/timezone'],
            input,
            plugins: [nodeResolve(), commonjs(), jsonPlugin({ compact: true })],
            treeshake: { moduleSideEffects: true },
        });
        try {
            for (const output of outputs(dist)) {
                await bundle.write(output);
            }
        } finally {
            await bundle.close();
        }
    }
}
