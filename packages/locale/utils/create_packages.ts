#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import defaults from '../prebuilt-packages.json' with { type: 'json' };

interface RootManifest {
    readonly version: string;
    readonly peerDependencies: Readonly<Record<string, string>>;
}

interface LocaleManifest {
    name: string;
    version: string;
    description: string;
    readonly repository: { readonly type: 'git'; readonly url: string };
    readonly main: string;
    readonly module: string;
    readonly keywords: readonly string[];
    readonly author: string;
    readonly contributors: readonly string[];
    readonly license: string;
    readonly bugs: { readonly url: string };
    readonly homepage: string;
    readonly peerDependencies: Readonly<Record<string, string>>;
    readonly peerDependenciesMeta: Readonly<Record<string, { readonly optional: boolean }>>;
    readonly dependencies: Readonly<Record<string, string>>;
    readonly devDependencies: Readonly<Record<string, string>>;
    readonly publishConfig: { readonly access: 'public' };
}

const dir = dirname(fileURLToPath(import.meta.url));
const parsed = parseArgs({
    options: {
        packagesDir: { type: 'string', short: 'p', default: resolve(dir, '../packages') },
        prebuiltDir: { type: 'string', short: 'b', default: resolve(dir, '../dist/prebuilt') },
        packages: { type: 'string' },
        debug: { type: 'boolean', default: false },
        help: { type: 'boolean', default: false },
    },
});

if (parsed.values.help) {
    console.log('Usage: create_packages [-p packages-dir] [-b prebuilt-dir] [--packages JSON] [--debug]');
    process.exit(0);
}

function requiredString(value: string | undefined, name: string): string {
    if (value === undefined || value.length === 0) {
        throw new Error(`${name} must be a non-empty path`);
    }
    return value;
}

const groups = parsed.values.packages === undefined
    ? defaults.packages
    : JSON.parse(parsed.values.packages) as Readonly<Record<string, readonly string[]>>;
const packagesDir = requiredString(parsed.values.packagesDir, 'packagesDir');
const prebuiltDir = requiredString(parsed.values.prebuiltDir, 'prebuiltDir');

if (parsed.values.debug) {
    console.log('create_packages options', { packagesDir, prebuiltDir, groups });
    console.log('create_packages cwd', process.cwd());
}

const root = JSON.parse(readFileSync(resolve(dir, '..', 'package.json'), 'utf8')) as RootManifest;
const readme = readFileSync(resolve(dir, 'README_package.template.md'), 'utf8');
const files = ['index.js', 'index.js.map', 'index.min.js', 'index.esm.js', 'index.esm.js.map'] as const;

function manifest(name: string, locales: readonly string[]): LocaleManifest {
    return {
        name: `@js-joda/locale_${name}`,
        version: root.version,
        description: `prebuilt js-joda locale package for locales: ${locales.join(',')}`,
        repository: { type: 'git', url: 'https://github.com/js-joda/js-joda.git' },
        main: 'dist/index.js',
        module: 'dist/index.esm.js',
        keywords: ['date', 'time', 'locale'],
        author: 'phueper',
        contributors: ['pithu', 'phueper'],
        license: 'BSD-3-Clause',
        bugs: { url: 'https://github.com/js-joda/js-joda/issues' },
        homepage: 'https://js-joda.github.io/js-joda',
        peerDependencies: {
            '@js-joda/core': root.peerDependencies['@js-joda/core'] ?? '',
            '@js-joda/timezone': root.peerDependencies['@js-joda/timezone'] ?? '',
            '@js-joda/locale': `>=${root.version}`,
        },
        peerDependenciesMeta: {
            '@js-joda/timezone': { optional: true },
        },
        dependencies: {},
        devDependencies: {},
        publishConfig: { access: 'public' },
    };
}

for (const [name, locales] of Object.entries(groups)) {
    console.info('creating', name);
    const packageDir = resolve(packagesDir, name);
    const distDir = resolve(packageDir, 'dist');
    const sourceDir = resolve(prebuiltDir, name);

    if (!existsSync(sourceDir)) {
        throw new Error(`prebuilt bundle not found for package ${name}.\nDid you forget to run "npm run build-prebuilt" ?`);
    }

    mkdirSync(distDir, { recursive: true });
    writeFileSync(resolve(packageDir, 'package.json'), `${JSON.stringify(manifest(name, locales), null, 4)}\n`);
    writeFileSync(resolve(packageDir, 'README.md'), readme.replaceAll('{{locale}}', locales.join(',')));

    for (const file of files) {
        copyFileSync(resolve(sourceDir, file), resolve(distDir, file));
    }
}
