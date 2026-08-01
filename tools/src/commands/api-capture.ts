import { captureApi } from '../compat.ts';

const api = await captureApi();
console.log(`Captured ${Object.keys(api.packages).length} package APIs.`);
