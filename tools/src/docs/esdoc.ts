import { spawn } from 'node:child_process';
import { fromRoot, root } from '../repo.ts';
import { cleanPublicSource, stagePublicSource } from './source.ts';

function runEsdoc(): Promise<void> {
    const command = fromRoot('node_modules', '.bin', 'esdoc');

    return new Promise((resolve, reject) => {
        const child = spawn(command, ['-c', 'esdoc.json'], {
            cwd: root,
            env: process.env,
            stdio: 'inherit',
        });

        child.once('error', reject);
        child.once('close', (code, signal) => {
            if (signal !== null) {
                reject(new Error(`ESDoc terminated by ${signal}`));
                return;
            }
            if (code !== 0) {
                reject(new Error(`ESDoc exited with status ${code ?? 1}`));
                return;
            }
            resolve();
        });
    });
}

export async function buildEsdoc(): Promise<number> {
    const count = await stagePublicSource();

    try {
        await runEsdoc();
        return count;
    } finally {
        await cleanPublicSource();
    }
}
