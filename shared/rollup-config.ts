import type { OutputOptions, RollupOptions } from 'rollup';

function output(value: RollupOptions['output']): OutputOptions {
    if (value === undefined || Array.isArray(value)) {
        return {};
    }

    return value as OutputOptions;
}

export function mergeConfig(base: RollupOptions, patch: RollupOptions): RollupOptions {
    const plugins = patch.plugins ?? base.plugins;
    return {
        ...base,
        ...patch,
        ...(plugins === undefined ? {} : { plugins }),
        output: {
            ...output(base.output),
            ...output(patch.output),
        },
    };
}
