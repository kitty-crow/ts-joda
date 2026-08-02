import { access, copyFile, mkdir, rm } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import { listFiles } from './repo.ts';

const sourceExt = new Set(['.js', '.cjs', '.mjs']);
const typeExt: Readonly<Record<string, string>> = {
    '.js': '.ts',
    '.cjs': '.cts',
    '.mjs': '.mts',
};

function packagePath(...parts: readonly string[]): string {
    return join(process.cwd(), ...parts);
}

async function exists(path: string): Promise<boolean> {
    try {
        await access(path);
        return true;
    } catch (error) {
        const code = error instanceof Error && 'code' in error ? error.code : undefined;
        if (code === 'ENOENT') {
            return false;
        }
        throw error;
    }
}

async function builtFiles(): Promise<string[]> {
    const build = packagePath('.build', 'src');
    const source = packagePath('src');
    const files = (await listFiles(build))
        .filter((path) => sourceExt.has(extname(path)))
        .sort();
    const generated = await Promise.all(files.map(async (file) => {
        const path = relative(build, file);
        const ext = extname(path);
        const peer = join(source, `${path.slice(0, -ext.length)}${typeExt[ext]}`);
        return await exists(peer) ? file : undefined;
    }));

    return generated.filter((file): file is string => file !== undefined);
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
