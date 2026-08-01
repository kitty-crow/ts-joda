import { extname } from 'node:path';
import { files, fromRoot, repoPath } from './lib/fs.ts';
import { workspaces } from './lib/packages.ts';

const ignored = [
    'docs/',
    'node_modules/',
    'packages/locale/packages/',
];
const js = new Set(['.js', '.jsx', '.cjs', '.mjs']);

function maintained(path: string): boolean {
    return !ignored.some((prefix) => path.startsWith(prefix));
}

const all = (await files(fromRoot('.'))).map(repoPath);
const source = all.filter(maintained);
const jsFiles = source.filter((path) => js.has(extname(path)));
const packages = await workspaces();

console.log(`Workspaces: ${packages.length}`);
for (const workspace of packages) {
    const { manifest } = workspace;
    console.log(`- ${manifest.name}@${manifest.version ?? 'private'}`);
}

console.log(`Maintained JavaScript-family files: ${jsFiles.length}`);
for (const path of jsFiles) {
    console.log(`- ${path}`);
}
