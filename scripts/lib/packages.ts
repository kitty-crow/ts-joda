import { dirname, join } from 'node:path';
import { files, fromRoot, json, repoPath } from './fs.ts';

export interface Manifest {
    readonly name: string;
    readonly version?: string;
    readonly private?: boolean;
    readonly main?: string;
    readonly module?: string;
    readonly typings?: string;
    readonly types?: string;
    readonly browser?: string | Record<string, string | false>;
    readonly bin?: string | Record<string, string>;
    readonly exports?: unknown;
    readonly files?: readonly string[];
    readonly peerDependencies?: Readonly<Record<string, string>>;
}

export interface Workspace {
    readonly dir: string;
    readonly file: string;
    readonly manifest: Manifest;
}

const generatedLocale = /packages\/locale\/packages\/[^/]+\/package\.json$/u;

export async function workspaces(): Promise<Workspace[]> {
    const manifests = (await files(fromRoot('packages')))
        .filter((path) => path.endsWith('/package.json'))
        .filter((path) => !generatedLocale.test(repoPath(path)))
        .sort();

    return Promise.all(manifests.map(async (file) => ({
        dir: dirname(file),
        file,
        manifest: await json<Manifest>(file),
    })));
}

export function typeFile(workspace: Workspace): string | undefined {
    const rel = workspace.manifest.types ?? workspace.manifest.typings;
    return rel === undefined ? undefined : join(workspace.dir, rel);
}
