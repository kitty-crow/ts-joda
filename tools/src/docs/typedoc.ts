import { spawn } from 'node:child_process';
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import ts from 'typescript';
import { fromRoot } from '../repo.ts';

const packages = ['core', 'extra', 'locale', 'timezone'] as const;
const runtime = [
    fromRoot('packages/core/dist/js-joda.min.js'),
    fromRoot('packages/extra/dist/js-joda-extra.min.js'),
    fromRoot('packages/timezone/dist/js-joda-timezone.min.js'),
    fromRoot('packages/locale/dist/js-joda-locale.min.js'),
    fromRoot('packages/locale/dist/prebuilt/en-us/index.min.js'),
    fromRoot('packages/locale/dist/prebuilt/de-de/index.js'),
] as const;

function command(file: string, args: readonly string[]): Promise<void> {
    return new Promise((resolve, reject) => {
        const child = spawn(file, args, {
            cwd: fromRoot(),
            env: process.env,
            stdio: 'inherit',
        });

        child.once('error', reject);
        child.once('close', (code, signal) => {
            if (signal !== null) {
                reject(new Error(`${file} terminated by ${signal}`));
                return;
            }
            if (code !== 0) {
                reject(new Error(`${file} exited with status ${code ?? 1}`));
                return;
            }
            resolve();
        });
    });
}

async function buildSite(out: string): Promise<void> {
    const file = fromRoot('tools/src/docs/site.ts');
    const source = await readFile(file, 'utf8');
    const result = ts.transpileModule(source, {
        fileName: file,
        reportDiagnostics: true,
        compilerOptions: {
            module: ts.ModuleKind.None,
            target: ts.ScriptTarget.ES2020,
        },
    });
    const errors = result.diagnostics?.filter(
        (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
    ) ?? [];

    if (errors.length > 0) {
        const message = errors
            .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
            .join('\n');
        throw new Error(`Failed to build the documentation site script:\n${message}`);
    }

    await writeFile(out, result.outputText, 'utf8');
}

async function copyRuntime(): Promise<void> {
    const out = fromRoot('docs/assets/runtime');
    await mkdir(out, { recursive: true });

    for (const file of runtime) {
        await copyFile(file, join(out, basename(file)));
    }
}

export async function buildDocs(): Promise<number> {
    const build = fromRoot('.build/docs');
    const site = join(build, 'site.js');

    await rm(build, { recursive: true, force: true });
    await mkdir(build, { recursive: true });
    await buildSite(site);
    await command(fromRoot('node_modules/.bin/typedoc'), ['--options', fromRoot('typedoc.json')]);
    await copyRuntime();

    return packages.length;
}
