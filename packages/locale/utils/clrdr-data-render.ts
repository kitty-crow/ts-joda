import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ejs from 'ejs';
import locales from 'cldr-data/availableLocales.json' with { type: 'json' };

const dir = dirname(fileURLToPath(import.meta.url));
const template = readFileSync(resolve(dir, 'cldr-data.ejs'), 'utf8');
const all = locales.availableLocales;

export default function renderCldrDataLoader(patterns: readonly string[]): string {
    const available = patterns.flatMap((pattern) => {
        const match = new RegExp(`^${pattern}$`, 'u');
        return all.filter((locale: string) => match.test(locale));
    });

    return ejs.render(template, { locales: available });
}
