import { nodeResolve } from '@rollup/plugin-node-resolve';
import { configureKarma } from '../../tools/src/build/karma.ts';
import { testGlob } from '../../tools/src/build/rollup.ts';
import { plugins } from './rollup.config.ts';

export default configureKarma({
    rollup: {
        plugins: [plugins.babel, plugins.json, nodeResolve(), testGlob()],
        output: {
            format: 'iife',
            name: 'JSJodaTimezone',
            sourcemap: 'inline',
            globals: {
                chai: 'chai',
            },
        },
        external: ['chai'],
    },
});
