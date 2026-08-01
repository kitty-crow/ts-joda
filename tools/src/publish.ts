import { copyFile, mkdir, rm } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import { listFiles } from './repo.ts';

const sourceExt = new Set(['.js', '.cjs', '.mjs']);

function packagePath(...parts: readonly string[]): string {
    return join(process.cwd(), ...parts);
}

async function builtFiles(): Promise<string[]> {
    const dir = packagePath('.build', 'src');
    return (await listFiles(dir))
        .filter((path) => sourceExt.has(extname(path)))
        .sort();
}

export async function installPublishedSource(): Promise<number> {
    const build = packagePath('.build', 'src');
    const source = packagePath('src');
    const files = await builtFiles();

    for (const file of files) {
        const out = join(source, relative(build, file));
        await mkdir(dirname(out), { recursive: true });
        await copyFile(file, out);
    }

    return files.length;
}

export async function cleanPublishedSource(): Promise<number> {
    const build = packagePath('.build', 'src');
    const source = packagePath('src');
    let files: string[];

    try {
        files = await builtFiles();
    } catch (error) {
        const code = error instanceof Error && 'code' in error ? error.code : undefined;
        if (code === 'ENOENT') {
            return 0;
        }
        throw error;
    }

    for (const file of files) {
        await rm(join(source, relative(build, file)), { force: true });
    }

    return files.length;
}
