#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { lstatSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';

interface Manifest {
    readonly name: string;
}

const dir = dirname(fileURLToPath(import.meta.url));
const parsed = parseArgs({
    options: {
        packagesDir: { type: 'string', short: 'p', default: resolve(dir, '../packages') },
        mainDir: { type: 'string', short: 'm', default: resolve(dir, '..') },
        dryRun: { type: 'boolean', short: 'd', default: true },
        beta: { type: 'boolean', short: 'b', default: true },
        release: { type: 'boolean', short: 'r', default: false },
        debug: { type: 'boolean', default: false },
        help: { type: 'boolean', default: false },
    },
});

if (parsed.values.help) {
    console.log('Usage: publish_release [-p packages-dir] [-m main-dir] [-d] [-b] [-r] [--debug]');
    process.exit(0);
}

function requiredString(value: string | undefined, name: string): string {
    if (value === undefined || value.length === 0) {
        throw new Error(`${name} must be a non-empty path`);
    }
    return value;
}

const packagesDir = requiredString(parsed.values.packagesDir, 'packagesDir');
const mainDir = requiredString(parsed.values.mainDir, 'mainDir');
const { dryRun, beta, debug } = parsed.values;
const args = ['publish', '--access=public'];
if (beta) {
    args.push('--tag', 'beta');
}

function read(path: string): Manifest {
    return JSON.parse(readFileSync(path, 'utf8')) as Manifest;
}

function publish(path: string): Promise<void> {
    const pkg = read(resolve(path, 'package.json'));
    const run = [...args, path];
    console.info('processing', pkg.name);

    if (debug) {
        console.log('running npm with args', run, 'cwd', path);
    }
    if (dryRun) {
        console.info('dryRun, not running npm publish');
        return Promise.resolve();
    }

    return new Promise((done, fail) => {
        execFile('npm', run, { cwd: path }, (error, stdout, stderr) => {
            if (stdout) {
                console.log(stdout);
            }
            if (stderr) {
                console.error(stderr);
            }
            if (error) {
                fail(error);
                return;
            }
            done();
        });
    });
}

const packageDirs = readdirSync(packagesDir)
    .map((name) => resolve(packagesDir, name))
    .filter((path) => lstatSync(path).isDirectory());

await Promise.all([...packageDirs, mainDir].map(publish));
