import { readFile } from 'node:fs/promises';
import { fromRoot } from './lib/fs.ts';
import './capture-api.ts';

const current = await readFile(fromRoot('compat', 'api-baseline.json'), 'utf8');
const expectedPath = fromRoot('compat', 'api-baseline.lock.json');
let expected: string;

try {
    expected = await readFile(expectedPath, 'utf8');
} catch {
    throw new Error('Missing compat/api-baseline.lock.json. Run npm run api:lock after reviewing the public surface.');
}

if (current !== expected) {
    throw new Error('Public package metadata or declarations changed. Review the diff and preserve the pre-refactor API.');
}

console.log('Public package metadata and declarations match the locked baseline.');
