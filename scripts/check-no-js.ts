import { extname } from 'node:path';
import { files, fromRoot, repoPath } from './lib/fs.ts';

const forbidden = new Set(['.js', '.jsx', '.cjs', '.mjs']);
const ignored = [
    'docs/',
    'node_modules/',
    'packages/locale/packages/',
];

const found = (await files(fromRoot('.')))
    .map(repoPath)
    .filter((path) => !ignored.some((prefix) => path.startsWith(prefix)))
    .filter((path) => forbidden.has(extname(path)))
    .sort();

if (found.length > 0) {
    const list = found.map((path) => `- ${path}`).join('\n');
    throw new Error(`JavaScript source remains:\n${list}`);
}

console.log('No maintained JavaScript-family source files found.');
