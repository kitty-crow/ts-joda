import { existsSync, readdirSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';
import { localePackages, packageDir, packages, root } from '../config.ts';
import { files, json } from '../lib/fs.ts';

interface Manifest {
    readonly name?: string;
    readonly version?: string;
    readonly workspaces?: readonly string[];
}

interface Lock {
    readonly packages?: Readonly<Record<string, Manifest>>;
}

const forbidden = new Set(['.cjs', '.html', '.js', '.jsx', '.mjs']);
const generated = [
    resolve(root, '.build'),
    resolve(root, 'node_modules'),
    resolve(packageDir, 'locales'),
    ...packages.flatMap((pkg) => [
        resolve(packageDir, pkg.id, 'dist'),
        resolve(packageDir, pkg.id, 'src'),
        resolve(packageDir, pkg.id, 'typings'),
    ]),
];

function under(path: string, parent: string): boolean {
    return path === parent || path.startsWith(`${parent}${sep}`);
}

function same(left: readonly string[], right: readonly string[]): boolean {
    return left.length === right.length && left.every((value, index) => value === right[index]);
}

function checkLocales(): void {
    const dir = resolve(packageDir, 'locales');
    if (!existsSync(dir)) {
        return;
    }

    const expected = Object.keys(localePackages).sort();
    const actual = readdirSync(dir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();
    if (!same(actual, expected)) {
        throw new Error(`Generated locale packages differ:\nexpected ${expected.join(', ')}\nactual ${actual.join(', ')}`);
    }

    for (const id of expected) {
        const manifest = json<Manifest>(resolve(dir, id, 'package.json'));
        const name = `@js-joda/locale_${id}`;
        if (manifest.name !== name || manifest.version !== '6.0.0') {
            throw new Error(`${name} must be generated at version 6.0.0`);
        }
    }
}

export function checkRepo(): void {
    const maintained = files(root).filter((path) => !generated.some((dir) => under(path, dir)));
    const bad = maintained.filter((path) => {
        const match = /\.[^.]+$/u.exec(path);
        return match !== null && forbidden.has(match[0]);
    });
    if (bad.length > 0) {
        throw new Error(`Tracked-source candidates contain JavaScript or HTML:\n${bad.map((path) => relative(root, path)).join('\n')}`);
    }

    for (const name of ['src', 'docs']) {
        if (!existsSync(resolve(root, name))) {
            throw new Error(`Missing root ${name}/ directory`);
        }
        const nested = maintained
            .map((path) => relative(root, path).split(sep))
            .filter((parts) => parts.slice(1).includes(name));
        if (nested.length > 0) {
            throw new Error(`Maintained ${name}/ directories must exist only at the repository root`);
        }
    }
    if (files(resolve(root, 'docs')).some((path) => !path.endsWith('.md'))) {
        throw new Error('docs/ must contain Markdown only');
    }

    const localeWorkspace = 'packages/locales/*';
    const rootManifest = json<Manifest>(resolve(root, 'package.json'));
    if (!rootManifest.workspaces?.includes(localeWorkspace)) {
        throw new Error('Generated locale packages must remain in the npm workspace surface');
    }
    const lock = json<Lock>(resolve(root, 'package-lock.json'));
    if (!lock.packages?.['']?.workspaces?.includes(localeWorkspace)) {
        throw new Error('package-lock.json must retain the generated locale workspace surface');
    }

    const versions: Readonly<Record<string, string>> = {
        core: '7.0.0',
        extra: '1.0.0',
        locale: '6.0.0',
        timezone: '3.0.0',
    };
    for (const pkg of packages) {
        const expected = versions[pkg.id];
        const manifest = json<Manifest>(resolve(packageDir, pkg.id, 'package.json'));
        if (manifest.version !== expected) {
            throw new Error(`${pkg.name} must be version ${expected}`);
        }
    }

    checkLocales();
}
