import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fromRoot } from '../repo.ts';
import { run } from '../run.ts';

const loader = '--import tsx';

function nodeOptions(value: string | undefined): string {
    const current = value?.trim();
    if (current === undefined || current.length === 0) {
        return loader;
    }
    return current.includes(loader) ? current : `${current} ${loader}`;
}

function runKarma(config: string, args: readonly string[]): Promise<void> {
    const cli = fromRoot('node_modules', 'karma', 'bin', 'karma');

    return new Promise((resolvePromise, reject) => {
        const child = spawn(process.execPath, [cli, 'start', config, ...args], {
            cwd: process.cwd(),
            env: {
                ...process.env,
                NODE_OPTIONS: nodeOptions(process.env.NODE_OPTIONS),
            },
            stdio: 'inherit',
        });

        child.once('error', reject);
        child.once('close', (code, signal) => {
            if (signal !== null) {
                reject(new Error(`Karma terminated by ${signal}`));
                return;
            }
            if (code !== 0) {
                reject(new Error(`Karma exited with status ${code ?? 1}`));
                return;
            }
            resolvePromise();
        });
    });
}

run(async () => {
    const cwd = process.cwd();
    const out = resolve(cwd, '.build');
    const wrapper = join(out, 'karma.config.cjs');
    const config = resolve(cwd, 'karma.conf.ts');

    await mkdir(out, { recursive: true });
    await writeFile(
        wrapper,
        `module.exports = require(${JSON.stringify(config)}).default;\n`,
        'utf8',
    );

    try {
        await runKarma(wrapper, process.argv.slice(2));
    } finally {
        await rm(wrapper, { force: true });
    }
});
