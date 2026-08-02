import { createRequire } from 'node:module';
import { mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fromRoot } from '../repo.ts';
import { run } from '../run.ts';

const require = createRequire(import.meta.url);

function packageDir(name: string): string {
    return dirname(require.resolve(`${name}/package.json`));
}

run(async () => {
    const out = fromRoot('.build', 'node_modules', 'cldr-data');
    const core = packageDir('cldr-core');
    const dates = packageDir('cldr-dates-full');

    await rm(out, { recursive: true, force: true });
    await mkdir(out, { recursive: true });
    await Promise.all([
        symlink(join(core, 'supplemental'), join(out, 'supplemental'), 'dir'),
        symlink(join(dates, 'main'), join(out, 'main'), 'dir'),
        symlink(join(core, 'availableLocales.json'), join(out, 'availableLocales.json'), 'file'),
    ]);
    await writeFile(join(out, 'package.json'), `${JSON.stringify({
        name: 'cldr-data',
        private: true,
        main: 'index.cjs',
    }, null, 2)}\n`, 'utf8');
    await writeFile(
        join(out, 'index.cjs'),
        "const { readFileSync } = require('node:fs');\nconst { join } = require('node:path');\nmodule.exports = path => JSON.parse(readFileSync(join(__dirname, path), 'utf8'));\n",
        'utf8',
    );
});
