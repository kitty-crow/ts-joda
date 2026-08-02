import { resolve } from 'node:path';
import { packageDir, packages, root } from '../config.ts';
import { copy, text, write } from '../lib/fs.ts';

export function buildMetadata(): void {
    for (const pkg of packages) {
        const doc = resolve(root, 'docs', `${pkg.id}.md`);
        write(resolve(packageDir, pkg.id, 'README.md'), text(doc));
        copy(resolve(root, 'LICENSE'), resolve(packageDir, pkg.id, 'LICENSE'));
    }
}
