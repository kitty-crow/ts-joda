import { access, copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import { listFiles } from './repo.ts';

interface Stage {
    readonly path: string;
    readonly saved: boolean;
}

const sourceExt = new Set(['.js', '.cjs', '.mjs']);
const stateName = '.published-source.json';
const backupName = '.published-source-backup';

function packagePath(...parts: readonly string[]): string {
    return join(process.cwd(), ...parts);
}

function errorCode(error: unknown): unknown {
    return error instanceof Error && 'code' in error ? error.code : undefined;
}

async function exists(path: string): Promise<boolean> {
    try {
        await access(path);
        return true;
    } catch (error) {
        if (errorCode(error) === 'ENOENT') {
            return false;
        }
        throw error;
    }
}

async function builtFiles(): Promise<string[]> {
    const build = packagePath('.build', 'src');
    return (await listFiles(build))
        .filter((path) => sourceExt.has(extname(path)))
        .sort();
}

function decodeStages(value: unknown): Stage[] {
    if (!Array.isArray(value) || !value.every((item) => (
        typeof item === 'object'
        && item !== null
        && 'path' in item
        && typeof item.path === 'string'
        && 'saved' in item
        && typeof item.saved === 'boolean'
    ))) {
        throw new Error('Invalid published-source staging state');
    }
    return value;
}

async function restoreStages(stages: readonly Stage[]): Promise<void> {
    const source = packagePath('src');
    const backup = packagePath('.build', backupName);

    for (const stage of [...stages].reverse()) {
        const target = join(source, stage.path);
        if (stage.saved) {
            await copyFile(join(backup, stage.path), target);
        } else {
            await rm(target, { force: true });
        }
    }
}

async function clearState(): Promise<void> {
    await Promise.all([
        rm(packagePath('.build', backupName), { recursive: true, force: true }),
        rm(packagePath('.build', stateName), { force: true }),
    ]);
}

export async function installPublishedSource(): Promise<number> {
    const build = packagePath('.build', 'src');
    const source = packagePath('src');
    const backup = packagePath('.build', backupName);
    const state = packagePath('.build', stateName);
    const files = await builtFiles();
    const stages: Stage[] = [];

    await clearState();

    try {
        for (const file of files) {
            const path = relative(build, file);
            const target = join(source, path);
            const saved = await exists(target);

            if (saved) {
                const copy = join(backup, path);
                await mkdir(dirname(copy), { recursive: true });
                await copyFile(target, copy);
            }

            await mkdir(dirname(target), { recursive: true });
            await copyFile(file, target);
            stages.push({ path, saved });
        }

        await writeFile(state, `${JSON.stringify(stages)}\n`, 'utf8');
        return stages.length;
    } catch (error) {
        await restoreStages(stages);
        await clearState();
        throw error;
    }
}

export async function cleanPublishedSource(): Promise<number> {
    const state = packagePath('.build', stateName);
    let stages: Stage[];

    try {
        stages = decodeStages(JSON.parse(await readFile(state, 'utf8')) as unknown);
    } catch (error) {
        if (errorCode(error) === 'ENOENT') {
            return 0;
        }
        throw error;
    }

    await restoreStages(stages);
    await clearState();
    return stages.length;
}
