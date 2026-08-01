import { nodeResolve } from '@rollup/plugin-node-resolve';
import type { Config, ConfigOptions } from 'karma';
import testGlob from '../../shared/rollup-test-glob.ts';
import { plugins } from './rollup.config.ts';

export default function configure(config: Config): void {
    const options: ConfigOptions = {
        files: [{ pattern: 'test/rollup-index.js', watched: false }],
        frameworks: ['mocha', 'chai'],
        preprocessors: {
            'test/rollup-index.js': ['rollup'],
        },
        rollupPreprocessor: {
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
        browserDisconnectTimeout: 10_000,
        browserNoActivityTimeout: 4 * 60 * 1_000,
        captureTimeout: 4 * 60 * 1_000,
        reporters: ['progress'],
        browsers: ['ChromeHeadless', 'FirefoxHeadless'],
        plugins: ['karma-*'],
    };

    config.set(options);
}
