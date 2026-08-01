import { buildEsdoc } from '../docs/esdoc.ts';
import { run } from '../run.ts';

run(async () => {
    const count = await buildEsdoc();
    console.log(`Generated documentation from ${count} public runtime source files.`);
});
