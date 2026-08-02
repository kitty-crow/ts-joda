import { resolve } from 'node:path';
import { buildDir, packageDir, packages, root } from '../config.ts';
import { copy, ensure, remove, write, writeJson } from '../lib/fs.ts';
import { run } from '../lib/proc.ts';

interface CompilerOptions {
    readonly [name: string]: unknown;
}

function paths(id: string): Readonly<Record<string, readonly string[]>> {
    const result: Record<string, readonly string[]> = {};
    if (id !== 'core') {
        result['@js-joda/core'] = ['packages/core/src/js-joda.d.ts'];
    }
    if (id === 'locale') {
        result['@js-joda/timezone'] = ['packages/timezone/src/js-joda-timezone.d.ts'];
    }
    return result;
}

function config(id: string): { readonly compilerOptions: CompilerOptions; readonly include: readonly string[] } {
    const source = resolve(root, 'src', id);
    const output = resolve(packageDir, id, 'src');
    return {
        compilerOptions: {
            allowImportingTsExtensions: true,
            allowSyntheticDefaultImports: true,
            baseUrl: root,
            declaration: true,
            declarationMap: true,
            esModuleInterop: true,
            exactOptionalPropertyTypes: true,
            forceConsistentCasingInFileNames: true,
            module: 'ESNext',
            moduleResolution: 'Bundler',
            noEmit: false,
            noFallthroughCasesInSwitch: true,
            noImplicitOverride: false,
            noImplicitReturns: true,
            noUncheckedIndexedAccess: true,
            outDir: output,
            paths: paths(id),
            resolveJsonModule: true,
            rewriteRelativeImportExtensions: true,
            rootDir: source,
            skipLibCheck: true,
            sourceMap: true,
            strict: true,
            target: 'ES2020',
            types: [],
            useDefineForClassFields: false,
            verbatimModuleSyntax: true,
        },
        include: [resolve(source, '**/*.ts')],
    };
}

function typeEntry(id: string): string {
    const name = id === 'core' ? 'js-joda' : `js-joda-${id}`;
    return `export * from '../src/${name}.js';\n`;
}

export function buildSources(): void {
    const configDir = resolve(buildDir, 'config');
    ensure(configDir);

    for (const pkg of packages) {
        const output = resolve(packageDir, pkg.id, 'src');
        remove(output);
        remove(resolve(packageDir, pkg.id, 'typings'));

        const path = resolve(configDir, `${pkg.id}.json`);
        writeJson(path, config(pkg.id));
        run(resolve(root, 'node_modules/.bin/tsc'), ['-p', path]);

        write(resolve(output, 'package.json'), '{"type":"module"}\n');
        if (pkg.id === 'timezone') {
            copy(resolve(root, 'src/timezone/data/packed'), resolve(output, 'data/packed'));
        }

        const typings = resolve(packageDir, pkg.id, 'typings');
        ensure(typings);
        write(resolve(typings, `${pkg.file}.d.ts`), typeEntry(pkg.id));
    }
}
