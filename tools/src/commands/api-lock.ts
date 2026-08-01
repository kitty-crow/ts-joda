import { lockApi } from '../compat.ts';

await lockApi();
console.log('Locked the reviewed pre-refactor package API.');
