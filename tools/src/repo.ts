import { createHash } from 'node:crypto';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
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

const moduleRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
export const root = resolve(process.env.TS_JODA_ROOT ?? moduleRoot);

export function fromRoot(...parts: readonly string[]): string {
    return join(root, ...parts);
}

export function rel(path: string): string {
    return relative(root, path).replaceAll('\\', '/');
}

export async function listFiles(dir: string): Promise<string[]> {
    const out: string[] = [];

    for (const name of await readdir(dir)) {
        const path = join(dir, name);
        const info = await stat(path);

        if (info.isDirectory()) {
            out.push(...await listFiles(path));
        } else {
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

const generatedLocale = /^packages\/locale\/packages\/[^/]+\/package\.json$/u;

export async function workspaces(): Promise<Workspace[]> {
    const manifests = (await listFiles(fromRoot('packages')))
        .filter((path) => path.endsWith('/package.json'))
        .filter((path) => !generatedLocale.test(rel(path)))
        .sort();

    return Promise.all(manifests.map(async (file) => ({
        dir: dirname(file),
        file,
        manifest: await json<Manifest>(file),
    })));
}

export function typeFile(workspace: Workspace): string | undefined {
    const path = workspace.manifest.types ?? workspace.manifest.typings;
    return path === undefined ? undefined : join(workspace.dir, path);
}
