import type { Config, ConfigOptions } from 'karma';
import type { RollupOptions } from 'rollup';

export interface KarmaBuild {
    readonly rollup: RollupOptions;
    readonly mochaTimeout?: number;
}

export function configureKarma(build: KarmaBuild): (config: Config) => void {
    return (config: Config): void => {
        const client = build.mochaTimeout === undefined
            ? undefined
            : { mocha: { timeout: build.mochaTimeout } };
        const options: ConfigOptions = {
            files: [{ pattern: 'test/rollup-index.js', watched: false }],
            frameworks: ['mocha', 'chai'],
            preprocessors: {
                'test/rollup-index.js': ['rollup'],
            },
            rollupPreprocessor: build.rollup,
            browserDisconnectTimeout: 10_000,
            browserNoActivityTimeout: 4 * 60 * 1_000,
            captureTimeout: 4 * 60 * 1_000,
            reporters: ['progress'],
            browsers: ['ChromeHeadless', 'FirefoxHeadless'],
            plugins: ['karma-*'],
            ...(client === undefined ? {} : { client }),
        };

        config.set(options);
    };
}
