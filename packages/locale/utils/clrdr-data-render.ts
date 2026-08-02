import { createRequire } from 'node:module';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ejs from 'ejs';

const require = createRequire(import.meta.url);
const dir = dirname(fileURLToPath(import.meta.url));
const dates = resolve(dirname(require.resolve('cldr-dates-full/package.json')), 'main');
const template = readFileSync(resolve(dir, 'cldr-data.ejs'), 'utf8');
const all = readdirSync(dates, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

export default function renderCldrDataLoader(patterns: readonly string[]): string {
    const available = patterns.flatMap((pattern) => {
        const match = new RegExp(`^${pattern}$`, 'u');
        return all.filter((locale) => match.test(locale));
    });

    return ejs.render(template, { locales: available });
}
