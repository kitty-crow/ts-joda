import { spawn } from 'node:child_process';
import { cleanPublishedSource, installPublishedSource } from '../publish.ts';
import { run as runCommand } from '../run.ts';

function spawnCommand(command: string, args: readonly string[]): Promise<number> {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            env: process.env,
            stdio: 'inherit',
        });
        child.once('error', reject);
        child.once('close', (code, signal) => {
            if (signal !== null) {
                reject(new Error(`${command} terminated by ${signal}`));
                return;
            }
            resolve(code ?? 1);
        });
    });
}

runCommand(async () => {
    const [command, ...args] = process.argv.slice(2);
    if (command === undefined || command.trim().length === 0) {
        throw new Error('Expected a non-empty command to run with generated source');
    }

    await installPublishedSource();
    try {
        process.exitCode = await spawnCommand(command, args);
    } finally {
        await cleanPublishedSource();
    }
});
