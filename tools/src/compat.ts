import { access, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import {
    fromRoot,
    listFiles,
    rel,
    saveJson,
    sha256,
    text,
    typeFile,
    workspaces,
    type Manifest,
    type Workspace,
} from './repo.ts';

interface PublicManifest {
    readonly name: string;
    readonly private?: boolean;
    readonly main?: string;
    readonly module?: string;
    readonly typings?: string;
    readonly types?: string;
    readonly browser?: Manifest['browser'];
    readonly bin?: Manifest['bin'];
    readonly exports?: unknown;
    readonly files?: readonly string[];
    readonly peerDependencies?: Readonly<Record<string, string>>;
}

interface TypeSurface {
    readonly path: string;
    readonly sha256: string;
}

interface PackageApi {
    readonly manifest: PublicManifest;
    readonly manifestPath: string;
    readonly scriptNames: readonly string[];
    readonly sourcePaths: readonly string[];
    readonly types?: TypeSurface;
}

export interface ApiBaseline {
    readonly schema: 2;
    readonly packages: Readonly<Record<string, PackageApi>>;
}

const currentPath = fromRoot('compat', 'api-baseline.json');
const lockPath = fromRoot('compat', 'api-baseline.lock.json');
const codeExt = new Map([
    ['.js', '.js'],
    ['.jsx', '.js'],
    ['.ts', '.js'],
    ['.tsx', '.js'],
    ['.mjs', '.mjs'],
    ['.mts', '.mjs'],
    ['.cjs', '.cjs'],
    ['.cts', '.cjs'],
]);

function publicManifest(manifest: Manifest): PublicManifest {
    const out: PublicManifest = { name: manifest.name };
    const keys = [
        'private', 'main', 'module', 'typings', 'types', 'browser',
        'bin', 'exports', 'files', 'peerDependencies',
    ] as const;

    for (const key of keys) {
        const value = manifest[key];
        if (value !== undefined) {
            Object.assign(out, { [key]: value });
        }
    }

    return out;
}

function publishedPath(workspace: Workspace, path: string): string | undefined {
    const next = codeExt.get(extname(path));
    if (next === undefined) {
        return undefined;
    }

    const local = relative(workspace.dir, path).replaceAll('\\', '/');
    return `${local.slice(0, -extname(local).length)}${next}`;
}

async function sourcePaths(workspace: Workspace): Promise<string[]> {
    const source = join(workspace.dir, 'src');
    let files: string[];

    try {
        files = await listFiles(source);
    } catch (error) {
        const code = error instanceof Error && 'code' in error ? error.code : undefined;
        if (code === 'ENOENT') {
            return [];
        }
        throw error;
    }

    return files
        .map((path) => publishedPath(workspace, path))
        .filter((path): path is string => path !== undefined)
        .sort();
}

async function typeSurface(workspace: Workspace): Promise<TypeSurface | undefined> {
    const path = typeFile(workspace);
    if (path === undefined) {
        return undefined;
    }

    await access(path);
    return { path: rel(path), sha256: sha256(await text(path)) };
}

export async function captureApi(): Promise<ApiBaseline> {
    const packages: Record<string, PackageApi> = {};

    for (const workspace of await workspaces()) {
        const types = await typeSurface(workspace);
        packages[workspace.manifest.name] = {
            manifest: publicManifest(workspace.manifest),
            manifestPath: rel(workspace.file),
            scriptNames: Object.keys(workspace.manifest.scripts ?? {}).sort(),
            sourcePaths: await sourcePaths(workspace),
            ...(types === undefined ? {} : { types }),
        };
    }

    const baseline: ApiBaseline = { schema: 2, packages };
    await saveJson(currentPath, baseline);
    return baseline;
}

export async function lockApi(): Promise<void> {
    await saveJson(lockPath, await captureApi());
}

function same(left: unknown, right: unknown): boolean {
    return JSON.stringify(left) === JSON.stringify(right);
}

function missing(required: readonly string[], current: readonly string[]): string[] {
    const found = new Set(current);
    return required.filter((value) => !found.has(value));
}

export async function checkApi(): Promise<void> {
    const current = await captureApi();
    const expected = await readFile(lockPath, 'utf8')
        .then((value) => JSON.parse(value) as ApiBaseline)
        .catch(() => {
            throw new Error('Missing compat/api-baseline.lock.json. Review the public surface, then run npm run api:lock.');
        });
    const errors: string[] = [];

    for (const [name, required] of Object.entries(expected.packages)) {
        const actual = current.packages[name];
        if (actual === undefined) {
            errors.push(`${name}: package is missing`);
            continue;
        }

        if (!same(actual.manifest, required.manifest)) {
            errors.push(`${name}: published manifest fields changed`);
        }

        const scripts = missing(required.scriptNames, actual.scriptNames);
        if (scripts.length > 0) {
            errors.push(`${name}: command names removed: ${scripts.join(', ')}`);
        }

        const paths = missing(required.sourcePaths, actual.sourcePaths);
        if (paths.length > 0) {
            errors.push(`${name}: published source paths removed: ${paths.join(', ')}`);
        }

        if (!same(actual.types, required.types)) {
            errors.push(`${name}: declaration entry point or contents changed`);
        }
    }

    if (errors.length > 0) {
        throw new Error(`Compatibility failures:\n${errors.map((error) => `- ${error}`).join('\n')}`);
    }
}
