import { nodeResolve } from '@rollup/plugin-node-resolve';
import {
    merge,
    testGlob,
} from '../../tools/src/build/rollup.ts';
import { configureKarma } from '../../tools/src/build/karma.ts';
import { base, plugins } from './rollup.config.ts';

export default configureKarma({
    rollup: merge(base, {
        onwarn: () => undefined,
        plugins: [plugins.babel, nodeResolve(), testGlob()],
        output: {
            format: 'iife',
            name: 'JSJodaExtra',
            sourcemap: 'inline',
            globals: { chai: 'chai' },
        },
        external: ['chai'],
    }),
});
