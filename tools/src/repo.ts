import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface Manifest {
    readonly name: string;
    readonly version?: string;
    readonly private?: boolean;
    readonly main?: string;
    readonly module?: string;
    readonly typings?: string;
    readonly types?: string;
    readonly browser?: string | Readonly<Record<string, string | false>>;
    readonly bin?: string | Readonly<Record<string, string>>;
    readonly exports?: unknown;
    readonly files?: readonly string[];
    readonly peerDependencies?: Readonly<Record<string, string>>;
    readonly scripts?: Readonly<Record<string, string>>;
}

export interface Workspace {
    readonly dir: string;
    readonly file: string;
    readonly manifest: Manifest;
}

export interface ListFilesOptions {
    readonly skipDirs?: ReadonlySet<string>;
    readonly skipDir?: (path: string) => boolean;
}

const moduleRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const root = resolve(process.env.TS_JODA_ROOT ?? moduleRoot);

export function fromRoot(...parts: readonly string[]): string {
    return join(root, ...parts);
}

export function rel(path: string): string {
    return relative(root, path).replaceAll('\\', '/');
}

export async function listFiles(
    dir: string,
    options: ListFilesOptions = {},
): Promise<string[]> {
    const out: string[] = [];

    for (const entry of await readdir(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);

        if (entry.isDirectory()) {
            if (options.skipDirs?.has(entry.name) || options.skipDir?.(path)) {
                continue;
            }
            out.push(...await listFiles(path, options));
            continue;
        }

        if (entry.isFile() || entry.isSymbolicLink()) {
            out.push(path);
        }
    }

    return out;
}

export async function text(path: string): Promise<string> {
    return readFile(path, 'utf8');
}

export async function json<T>(path: string): Promise<T> {
    return JSON.parse(await text(path)) as T;
}

export async function saveJson(path: string, value: unknown): Promise<void> {
    await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

export function sha256(value: string): string {
    return createHash('sha256').update(value).digest('hex');
}

const workspaceIgnoredDirs = new Set([
    '.build', 'build', 'dist', 'node_modules', 'tmp',
]);
const generatedLocalesDir = 'packages/locale/packages';

async function workspaceManifests(): Promise<string[]> {
    return (await listFiles(fromRoot('packages'), {
        skipDirs: workspaceIgnoredDirs,
        skipDir: (path) => rel(path) === generatedLocalesDir,
    }))
        .filter((path) => path.endsWith('/package.json'))
        .sort();
}

export async function workspaces(): Promise<Workspace[]> {
    return Promise.all((await workspaceManifests()).map(async (file) => ({
        dir: dirname(file),
        file,
        manifest: await json<Manifest>(file),
    })));
}

export function typeFile(workspace: Workspace): string | undefined {
    const path = workspace.manifest.types ?? workspace.manifest.typings;
    return path === undefined ? undefined : join(workspace.dir, path);
}
