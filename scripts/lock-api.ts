import { copyFile } from 'node:fs/promises';
import { fromRoot } from './lib/fs.ts';
import './capture-api.ts';

await copyFile(
    fromRoot('compat', 'api-baseline.json'),
    fromRoot('compat', 'api-baseline.lock.json'),
);
console.log('Locked the current public API baseline.');
