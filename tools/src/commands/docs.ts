import { buildDocs } from '../docs/typedoc.ts';
import { run } from '../run.ts';

run(async () => {
    const count = await buildDocs();
    console.log(`Generated documentation for ${count} public packages.`);
});
