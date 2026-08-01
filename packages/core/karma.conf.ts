import {
    merge,
    testGlob,
} from '../../tools/src/build/rollup.ts';
import { configureKarma } from '../../tools/src/build/karma.ts';
import { base, plugins } from './rollup.config.ts';

export default configureKarma({
    mochaTimeout: 6_000,
    rollup: merge(base, {
        onwarn: () => undefined,
        plugins: [plugins.babel, testGlob()],
        output: {
            format: 'iife',
            name: 'JSJoda',
            sourcemap: 'inline',
        },
    }),
});
