import { nodeResolve } from '@rollup/plugin-node-resolve';
import type { Config, ConfigOptions } from 'karma';
import { mergeConfig } from '../../shared/rollup-config.ts';
import testGlob from '../../shared/rollup-test-glob.ts';
import { defaultConfig, plugins } from './rollup.config.ts';

const rollupConfig = mergeConfig(defaultConfig, {
    onwarn: () => undefined,
    plugins: [plugins.babel, nodeResolve(), testGlob()],
    output: {
        format: 'iife',
        name: 'JSJodaExtra',
        sourcemap: 'inline',
        globals: {
            chai: 'chai',
        },
    },
    external: ['chai'],
});

export default function configure(config: Config): void {
    const options: ConfigOptions = {
        files: [{ pattern: 'test/rollup-index.js', watched: false }],
        frameworks: ['mocha', 'chai'],
        preprocessors: {
            'test/rollup-index.js': ['rollup'],
        },
        rollupPreprocessor: rollupConfig,
        browserDisconnectTimeout: 10_000,
        browserNoActivityTimeout: 4 * 60 * 1_000,
        captureTimeout: 4 * 60 * 1_000,
        reporters: ['progress'],
        browsers: ['ChromeHeadless', 'FirefoxHeadless'],
        plugins: ['karma-*'],
    };

    config.set(options);
}
