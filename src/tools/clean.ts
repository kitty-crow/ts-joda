import { resolve } from 'node:path';
import { buildDir, packageDir, packages } from './config.ts';
import { remove } from './lib/fs.ts';

remove(resolve(buildDir, '..'));
remove(resolve(packageDir, 'locales'));
for (const pkg of packages) {
    for (const name of ['dist', 'src', 'typings', 'README.md', 'LICENSE']) {
        remove(resolve(packageDir, pkg.id, name));
    }
}
