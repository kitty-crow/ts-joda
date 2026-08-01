import { checkApi } from '../compat.ts';
import { run } from '../run.ts';

run(async () => {
    await checkApi();
    console.log('Published metadata, command names, source paths and declarations match the compatibility lock.');
});
