import { mkdir, rm, writeFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { fromRoot, listFiles, rel, text, workspaces, type Workspace } from '../repo.ts';

const runtimePackages = new Set([
    '@js-joda/core',
    '@js-joda/extra',
    '@js-joda/locale',
    '@js-joda/timezone',
]);
const javascript = new Set(['.js', '.cjs', '.mjs']);

export const sourceStage = fromRoot('.build', 'esdoc-source');

function missing(error: unknown): boolean {
    return error instanceof Error && 'code' in error && error.code === 'ENOENT';
}

async function files(dir: string): Promise<string[]> {
    try {
        return (await listFiles(dir))
            .filter((path) => javascript.has(extname(path)))
            .sort();
    } catch (error) {
        if (missing(error)) {
            return [];
        }
        throw error;
    }
}

function stripSourceMap(value: string): string {
    return value
        .replace(/^\/\/# sourceMappingURL=.*(?:\r?\n)?/gmu, '')
        .replace(/^\/\/@ sourceMappingURL=.*(?:\r?\n)?/gmu, '');
}

async function packageSources(workspace: Workspace): Promise<ReadonlyMap<string, string>> {
    const source = join(workspace.dir, 'src');
    const built = join(workspace.dir, '.build', 'src');
    const paths = new Map<string, string>();

    for (const path of await files(source)) {
        paths.set(relative(source, path), path);
    }
    for (const path of await files(built)) {
        paths.set(relative(built, path), path);
    }

    return paths;
}

async function stagePackage(workspace: Workspace): Promise<number> {
    const sources = await packageSources(workspace);
    const out = join(sourceStage, rel(workspace.dir), 'src');

    for (const [path, input] of sources) {
        const target = join(out, path);
        await mkdir(join(target, '..'), { recursive: true });
        await writeFile(target, stripSourceMap(await text(input)), 'utf8');
    }

    return sources.size;
}

export async function stagePublicSource(): Promise<number> {
    await rm(sourceStage, { force: true, recursive: true });

    const packages = (await workspaces())
        .filter(({ manifest }) => runtimePackages.has(manifest.name));
    const counts = await Promise.all(packages.map(stagePackage));
    const count = counts.reduce((sum, value) => sum + value, 0);

    if (count === 0) {
        throw new Error('No public runtime source was available for documentation');
    }

    return count;
}

export async function cleanPublicSource(): Promise<void> {
    await rm(sourceStage, { force: true, recursive: true });
}
