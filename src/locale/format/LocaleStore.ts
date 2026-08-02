import { type TextStyle } from '@js-joda/core';
import type { TextEntry } from '../core-types.ts';

export type TextMap = Readonly<Record<number, string>>;
export type StyleTextMap = Readonly<Record<string, TextMap>>;

export function styleKey(style: TextStyle | null): string {
    return style === null ? '*' : style.toString();
}

export function createEntry(text: string, value: number): TextEntry {
    return {
        key: text,
        value,
        toString: () => `${text}->${value}`,
    };
}

function byLongestText(first: TextEntry, second: TextEntry): number {
    return second.key.length - first.key.length || first.key.localeCompare(second.key);
}

/** Text lookup for one locale, indexed by text style. */
export class LocaleStore {
    private readonly valueTextMap: StyleTextMap;
    private readonly parsable = new Map<string, readonly TextEntry[]>();

    constructor(valueTextMap: StyleTextMap) {
        this.valueTextMap = valueTextMap;
        const all: TextEntry[] = [];

        for (const [style, values] of Object.entries(valueTextMap)) {
            const seen = new Set<string>();
            const entries: TextEntry[] = [];
            let unique = true;

            for (const [rawValue, text] of Object.entries(values)) {
                if (seen.has(text)) {
                    unique = false;
                    break;
                }
                seen.add(text);
                entries.push(createEntry(text, Number(rawValue)));
            }

            if (!unique) {
                continue;
            }
            entries.sort(byLongestText);
            this.parsable.set(style, entries);
            all.push(...entries);
        }

        all.sort(byLongestText);
        this.parsable.set('*', all);
    }

    getText(value: number, style: TextStyle): string | null {
        return this.valueTextMap[styleKey(style)]?.[value] ?? null;
    }

    getTextIterator(style: TextStyle | null): IterableIterator<TextEntry> | null {
        return this.parsable.get(styleKey(style))?.[Symbol.iterator]() ?? null;
    }
}
