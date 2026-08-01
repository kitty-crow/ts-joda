import { access } from 'node:fs/promises';
import { basename } from 'node:path';
import { fromRoot, hash, repoPath, saveJson, text } from './lib/fs.ts';
import { typeFile, workspaces, type Manifest } from './lib/packages.ts';

interface PublicManifest {
    readonly name: string;
    readonly private?: boolean;
    readonly main?: string;
    readonly module?: string;
    readonly typings?: string;
    readonly types?: string;
    readonly browser?: Manifest['browser'];
    readonly bin?: Manifest['bin'];
    readonly exports?: unknown;
    readonly files?: readonly string[];
    readonly peerDependencies?: Readonly<Record<string, string>>;
}

interface PackageApi {
    readonly manifest: PublicManifest;
    readonly manifestPath: string;
    readonly types?: {
        readonly path: string;
        readonly sha256: string;
    };
}

interface ApiBaseline {
    readonly schema: 1;
    readonly packages: Readonly<Record<string, PackageApi>>;
}

function publicManifest(manifest: Manifest): PublicManifest {
    const out: PublicManifest = { name: manifest.name };
    const keys = [
        'private',
        'main',
        'module',
        'typings',
        'types',
        'browser',
        'bin',
        'exports',
        'files',
        'peerDependencies',
    ] as const;

    for (const key of keys) {
        const value = manifest[key];
        if (value !== undefined) {
            Object.assign(out, { [key]: value });
        }
    }

    return out;
}

const packages: Record<string, PackageApi> = {};
for (const workspace of await workspaces()) {
    const typePath = typeFile(workspace);
    let types: PackageApi['types'];

    if (typePath !== undefined) {
        await access(typePath);
        types = {
            path: repoPath(typePath),
            sha256: hash(await text(typePath)),
        };
    }

    packages[workspace.manifest.name] = {
        manifest: publicManifest(workspace.manifest),
        manifestPath: repoPath(workspace.file),
        ...(types === undefined ? {} : { types }),
    };
}

const baseline: ApiBaseline = { schema: 1, packages };
const out = fromRoot('compat', 'api-baseline.json');
await saveJson(out, baseline);
console.log(`Captured ${Object.keys(packages).length} package APIs in ${basename(out)}.`);
