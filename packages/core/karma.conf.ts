import type { Config, ConfigOptions } from 'karma';
import testGlob from '../../shared/rollup-test-glob.ts';
import { defaultConfig, plugins } from './rollup.config.ts';

const rollupConfig = {
    ...defaultConfig,
    onwarn: () => undefined,
    plugins: [plugins.babel, testGlob()],
    output: {
        ...defaultConfig.output,
        format: 'iife',
        name: 'JSJoda',
        sourcemap: 'inline',
    },
};

function configure(config: Config): void {
    const options: ConfigOptions = {
        files: [
            { pattern: 'test/rollup-index.js', watched: false },
        ],
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
        client: {
            mocha: {
                timeout: 6_000,
            },
        },
    };

    config.set(options);
}

export default configure;
