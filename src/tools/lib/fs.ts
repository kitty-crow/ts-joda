import {
    cpSync,
    existsSync,
    mkdirSync,
    readFileSync,
    readdirSync,
    rmSync,
    statSync,
    writeFileSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';

export function ensure(path: string): void {
    mkdirSync(path, { recursive: true });
}

export function remove(path: string): void {
    rmSync(path, { force: true, recursive: true });
}

export function text(path: string): string {
    return readFileSync(path, 'utf8');
}

export function write(path: string, value: string): void {
    ensure(dirname(path));
    writeFileSync(path, value);
}

export function json<T>(path: string): T {
    return JSON.parse(text(path)) as T;
}

export function writeJson(path: string, value: unknown): void {
    write(path, `${JSON.stringify(value, null, 2)}\n`);
}

export function copy(from: string, to: string): void {
    ensure(dirname(to));
    cpSync(from, to, { recursive: true });
}

export function files(path: string): string[] {
    if (!existsSync(path)) {
        return [];
    }

    return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
        const item = resolve(path, entry.name);
        return entry.isDirectory() ? files(item) : [item];
    });
}

export function dirs(path: string): string[] {
    if (!existsSync(path)) {
        return [];
    }

    return readdirSync(path, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => resolve(path, entry.name));
}

export function size(path: string): number {
    return statSync(path).size;
}
