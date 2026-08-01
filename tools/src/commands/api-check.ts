import { checkApi } from '../compat.ts';

await checkApi();
console.log('Published metadata, command names, source paths and declarations match the compatibility lock.');
