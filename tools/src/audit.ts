import { readdir, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { rel, root, workspaces } from './repo.ts';

export interface Inventory {
    readonly workspaces: number;
    readonly sourceFiles: number;
    readonly javascriptFiles: number;
    readonly typescriptFiles: number;
}

const ignoredDirs = new Set([
    '.build', '.git', '.nyc_output', 'build', 'dist', 'docs', 'node_modules', 'tmp',
]);
const js = new Set(['.js', '.jsx', '.cjs', '.mjs']);
const ts = new Set(['.ts', '.tsx', '.cts', '.mts']);

function ignored(path: string, name: string): boolean {
    if (ignoredDirs.has(name)) {
        return true;
    }
    return rel(path).startsWith('packages/locale/packages/');
}

async function maintainedFiles(dir: string): Promise<string[]> {
    const out: string[] = [];

    for (const name of await readdir(dir)) {
        const path = join(dir, name);
        if (ignored(path, name)) {
            continue;
        }

        const info = await stat(path);
        if (info.isDirectory()) {
            out.push(...await maintainedFiles(path));
        } else {
            out.push(path);
        }
    }

    return out;
}

export async function inventory(): Promise<Inventory> {
    const files = await maintainedFiles(root);
    const javascriptFiles = files.filter((path) => js.has(extname(path))).length;
    const typescriptFiles = files.filter((path) => ts.has(extname(path))).length;

    return {
        workspaces: (await workspaces()).length,
        sourceFiles: javascriptFiles + typescriptFiles,
        javascriptFiles,
        typescriptFiles,
    };
}

export async function assertNoJavascript(): Promise<void> {
    const files = (await maintainedFiles(root))
        .filter((path) => js.has(extname(path)))
        .map(rel)
        .sort();

    if (files.length === 0) {
        return;
    }

    throw new Error(`Maintained JavaScript-family files remain:\n${files.map((path) => `- ${path}`).join('\n')}`);
}
