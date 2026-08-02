import { resolve } from 'node:path';
import { buildDir, packageDir, packages } from './config.ts';
import { buildBundles } from './build/bundle.ts';
import { buildLocales } from './build/locales.ts';
import { buildMetadata } from './build/meta.ts';
import { buildSources } from './build/source.ts';
import { ensure, remove } from './lib/fs.ts';

remove(buildDir);
ensure(buildDir);
for (const pkg of packages) {
    remove(resolve(packageDir, pkg.id, 'dist'));
}

buildSources();
await buildBundles();
await buildLocales();
buildMetadata();
console.log('Built strict TypeScript packages and compatibility distributions.');
