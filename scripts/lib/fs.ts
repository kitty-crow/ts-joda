import { createHash } from 'node:crypto';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';

export const root = resolve(process.cwd());

export async function files(dir: string): Promise<string[]> {
    const out: string[] = [];

    for (const name of await readdir(dir)) {
        const path = join(dir, name);
        const info = await stat(path);

        if (info.isDirectory()) {
            out.push(...await files(path));
            continue;
        }

        out.push(path);
    }

    return out;
}

export function repoPath(path: string): string {
    return relative(root, path).replaceAll('\\', '/');
}

export async function text(path: string): Promise<string> {
    return readFile(path, 'utf8');
}

export async function json<T>(path: string): Promise<T> {
    return JSON.parse(await text(path)) as T;
}

export async function saveJson(path: string, value: unknown): Promise<void> {
    const body = `${JSON.stringify(value, null, 2)}\n`;
    await writeFile(path, body, 'utf8');
}

export function hash(value: string): string {
    return createHash('sha256').update(value).digest('hex');
}

export function fromRoot(...parts: string[]): string {
    return join(root, ...parts);
}

export function parent(path: string): string {
    return dirname(path);
}
