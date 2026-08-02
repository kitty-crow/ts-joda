import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { run } from '../run.ts';

const names = [
    'glob',
    'tar',
    'q',
    'read-package-json',
    'git-semver-tags',
    'git-raw-commits',
    '@lerna/legacy-package-management',
    '@lerna/create',
    'eslint',
] as const;

interface Result {
    readonly code: number;
    readonly out: string;
}

function npm(args: readonly string[]): Result {
    const result = spawnSync('npm', args, {
        cwd: process.cwd(),
        encoding: 'utf8',
        maxBuffer: 128 * 1024 * 1024,
    });
    const out = `${result.stdout ?? ''}${result.stderr ?? ''}`;
    return { code: result.status ?? 1, out };
}

function auditTotal(text: string): number | null {
    try {
        const value = JSON.parse(text) as {
            metadata?: { vulnerabilities?: { total?: number } };
        };
        return value.metadata?.vulnerabilities?.total ?? null;
    } catch {
        return null;
    }
}

function installedCount(text: string): number {
    const lines = text.split(/\r?\n/u).filter((line) => line.trim().length > 0);
    return Math.max(0, lines.length - 1);
}

function deprecated(text: string): string[] {
    const found = new Set<string>();
    for (const line of text.split(/\r?\n/u)) {
        const match = /^npm warn deprecated ([^:]+):/u.exec(line);
        if (match?.[1] !== undefined) {
            found.add(match[1]);
        }
    }
    return [...found].sort();
}

run(async () => {
    const dir = join(process.cwd(), 'build', 'deps');
    await mkdir(dir, { recursive: true });

    const explanations: string[] = [];
    for (const name of names) {
        const result = npm(['explain', name]);
        explanations.push(`## ${name}\nexit: ${result.code}\n\n${result.out.trim()}\n`);
    }

    const audit = npm(['audit', '--json']);
    const productionAudit = npm(['audit', '--omit=dev', '--json']);
    const tree = npm(['ls', '--all', '--json']);
    const paths = npm(['ls', '--all', '--parseable']);

    let installLog = '';
    try {
        installLog = await readFile(join(dir, 'npm-install.log'), 'utf8');
    } catch {
        // The command also works outside CI, where no captured install log exists.
    }

    const deprecatedPackages = deprecated(installLog);
    const summary = {
        installedPackages: installedCount(paths.out),
        deprecatedWarnings: installLog.split(/\r?\n/u).filter((line) => line.startsWith('npm warn deprecated ')).length,
        deprecatedPackages,
        audit: auditTotal(audit.out),
        productionAudit: auditTotal(productionAudit.out),
    };

    await Promise.all([
        writeFile(join(dir, 'explain.md'), `${explanations.join('\n')}\n`),
        writeFile(join(dir, 'audit.json'), audit.out),
        writeFile(join(dir, 'audit-production.json'), productionAudit.out),
        writeFile(join(dir, 'tree.json'), tree.out),
        writeFile(join(dir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`),
    ]);

    console.log(JSON.stringify(summary, null, 2));
});
