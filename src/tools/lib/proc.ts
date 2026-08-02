import { spawnSync } from 'node:child_process';

export function run(command: string, args: readonly string[], cwd = process.cwd()): void {
    const result = spawnSync(command, args, {
        cwd,
        encoding: 'utf8',
        stdio: 'inherit',
    });

    if (result.error !== undefined) {
        throw result.error;
    }
    if (result.status !== 0) {
        throw new Error(`${command} exited with ${result.status ?? 'no status'}`);
    }
}
