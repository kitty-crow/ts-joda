import { join } from 'node:path';
import { sync as glob } from 'glob';
import type { Plugin } from 'rollup';

const pattern = '**';

export default function testGlob(): Plugin {
    return {
        name: 'test-glob',
        resolveId(id: string) {
            return id.startsWith(pattern) ? id : null;
        },
        load(id: string) {
            if (!id.startsWith(pattern)) {
                return null;
            }

            return glob(id, { cwd: process.cwd() })
                .map((file: string, i: number) => {
                    const path = join(process.cwd(), file);
                    return `import _${i} from ${JSON.stringify(path)}; export { _${i} };`;
                })
                .join('\n');
        },
    };
}
