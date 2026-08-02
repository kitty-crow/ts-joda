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
        readonly globals?: Readonly<Record<string, string>>;
        readonly name?: string;
        readonly sourcemap?: boolean | 'inline' | 'hidden';
    }

    export interface RollupOptions {
        readonly external?: readonly string[];
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


declare module '@rollup/plugin-node-resolve' {
    import type { Plugin } from 'rollup';
    export function nodeResolve(): Plugin;
}

declare module '@rollup/plugin-commonjs' {
    import type { Plugin } from 'rollup';
    export default function commonjs(): Plugin;
}

declare module '@rollup/plugin-json' {
    import type { Plugin } from 'rollup';
    export default function json(): Plugin;
}

declare module '@rollup/plugin-replace' {
    import type { Plugin } from 'rollup';
    interface ReplaceOptions {
        readonly preventAssignment?: boolean;
        readonly [key: string]: string | boolean | undefined;
    }
    export default function replace(options: ReplaceOptions): Plugin;
}

declare module '@rollup/plugin-virtual' {
    import type { Plugin } from 'rollup';
    export default function virtual(modules: Readonly<Record<string, string>>): Plugin;
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
        readonly ignore?: readonly string[];
        readonly nodir?: boolean;
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
        readonly basePath?: string;
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


declare module 'ejs' {
    interface RenderData {
        readonly [key: string]: unknown;
    }
    interface Ejs {
        render(template: string, data: RenderData): string;
    }
    const ejs: Ejs;
    export default ejs;
}

declare module 'cldr-data/availableLocales.json' {
    const data: {
        readonly availableLocales: readonly string[];
    };
    export default data;
}

declare module 'moment-timezone/moment-timezone-utils' {
    const moment: unknown;
    export default moment;
}
