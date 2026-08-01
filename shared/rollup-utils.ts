import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface PackageId {
    readonly name: string;
    readonly version: string;
}

const dir = dirname(fileURLToPath(import.meta.url));

export function createBanner(pkg: PackageId): string {
    const head = `//! @version ${pkg.name} - ${pkg.version}\n`;
    const licence = readFileSync(resolve(dir, 'license-preamble.txt'), 'utf8');
    return head + licence;
}
