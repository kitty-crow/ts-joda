declare module 'rollup' {
    export interface Plugin {
        readonly name: string;
        readonly resolveId?: (id: string) => string | null | Promise<string | null>;
        readonly load?: (id: string) => string | null | Promise<string | null>;
    }

    export interface OutputOptions {
        readonly banner?: string;
        readonly file?: string;
        readonly format?: 'amd' | 'cjs' | 'es' | 'iife' | 'system' | 'umd';
        readonly name?: string;
        readonly sourcemap?: boolean | 'inline' | 'hidden';
    }

    export interface RollupOptions {
        readonly input?: string;
        readonly onwarn?: (...args: readonly unknown[]) => void;
        readonly output?: OutputOptions | readonly OutputOptions[];
        readonly plugins?: readonly Plugin[];
    }
}

declare module '@rollup/plugin-babel' {
    import type { Plugin } from 'rollup';

    interface BabelOptions {
        readonly babelHelpers: 'bundled' | 'runtime' | 'inline' | 'external';
    }

    export function babel(options: BabelOptions): Plugin;
}

declare module 'rollup-plugin-minification' {
    import type { Plugin } from 'rollup';

    interface TerserOptions {
        readonly output?: {
            readonly comments?: RegExp;
        };
    }

    export function terser(options?: TerserOptions): Plugin;
}

declare module 'glob' {
    interface GlobOptions {
        readonly cwd?: string;
    }

    export function sync(pattern: string, options?: GlobOptions): string[];
}

declare module 'karma' {
    interface Pattern {
        readonly pattern: string;
        readonly watched?: boolean;
    }

    interface ClientOptions {
        readonly mocha?: {
            readonly timeout?: number;
        };
    }

    export interface ConfigOptions {
        readonly files?: readonly (string | Pattern)[];
        readonly frameworks?: readonly string[];
        readonly preprocessors?: Readonly<Record<string, readonly string[]>>;
        readonly rollupPreprocessor?: unknown;
        readonly browserDisconnectTimeout?: number;
        readonly browserNoActivityTimeout?: number;
        readonly captureTimeout?: number;
        readonly reporters?: readonly string[];
        readonly browsers?: readonly string[];
        readonly plugins?: readonly string[];
        readonly client?: ClientOptions;
    }

    export interface Config {
        set(options: ConfigOptions): void;
    }
}
