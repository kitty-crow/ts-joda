import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { run } from '../run.ts';

const start = '<!-- toc -->';
const stop = '<!-- tocstop -->';

interface Heading {
    readonly depth: 2 | 3;
    readonly label: string;
    readonly slug: string;
}

function plain(label: string): string {
    return label
        .replace(/!\[([^\]]*)\]\([^)]*\)/gu, '$1')
        .replace(/\[([^\]]+)\]\([^)]*\)/gu, '$1')
        .replace(/<[^>]+>/gu, '')
        .replace(/[`*_~]/gu, '');
}

function anchor(label: string): string {
    return plain(label)
        .toLowerCase()
        .trim()
        .replace(/[^\p{L}\p{N}\s_-]/gu, '')
        .replace(/\s+/gu, '-');
}

function headings(source: string): Heading[] {
    const found: Heading[] = [];
    const seen = new Map<string, number>();
    let fence: string | undefined;

    for (const line of source.split(/\r?\n/u)) {
        const marker = line.match(/^\s*(`{3,}|~{3,})/u)?.[1];
        if (marker !== undefined) {
            const char = marker[0];
            if (fence === undefined) {
                fence = char;
            } else if (fence === char) {
                fence = undefined;
            }
            continue;
        }
        if (fence !== undefined) {
            continue;
        }

        const match = line.match(/^(#{2,3})[ \t]+(.+?)[ \t]*#*[ \t]*$/u);
        if (match === null) {
            continue;
        }

        const marks = match[1];
        const label = match[2];
        if (marks === undefined || label === undefined) {
            continue;
        }

        const base = anchor(label);
        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        found.push({
            depth: marks.length as 2 | 3,
            label,
            slug: count === 0 ? base : `${base}-${count}`,
        });
    }

    return found;
}

function render(items: readonly Heading[], eol: string): string {
    return items
        .map(({ depth, label, slug }) => `${depth === 2 ? '-' : '  *'} [${label}](#${slug})`)
        .join(eol);
}

run(async () => {
    const file = resolve(process.cwd(), process.argv[2] ?? 'CheatSheet.md');
    const source = await readFile(file, 'utf8');
    const begin = source.indexOf(start);
    const end = source.indexOf(stop);

    if (begin < 0 || end < 0) {
        throw new Error(`Missing ${begin < 0 ? start : stop} in ${file}.`);
    }
    if (end < begin) {
        throw new Error(`${stop} appears before ${start} in ${file}.`);
    }

    const eol = source.includes('\r\n') ? '\r\n' : '\n';
    const body = source.slice(end + stop.length);
    const toc = render(headings(body), eol);
    const next = `${source.slice(0, begin)}${start}${eol}${eol}${toc}${eol}${eol}${stop}${body}`;

    if (next !== source) {
        await writeFile(file, next, 'utf8');
    }
});
