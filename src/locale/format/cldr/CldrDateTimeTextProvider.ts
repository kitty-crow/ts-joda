import {
    ChronoField,
    IsoFields,
    TextStyle,
    type TemporalField,
} from '@js-joda/core';
import type Locale from '../../Locale.ts';
import type { TextEntry, TextProvider } from '../../core-types.ts';
import {
    LocaleStore,
    styleKey,
    type StyleTextMap,
    type TextMap,
} from '../LocaleStore.ts';
import {
    getOrCreateCldrInstance,
    getRegisteredLocales,
    loadCldrData,
} from './CldrCache.ts';

declare const require: ((id: string) => unknown) | undefined;

type Json = Record<string, unknown>;
type StyleSource = Readonly<Record<string, TextMap>>;

const MONTH_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const;
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const QUARTER_KEYS = ['1', '2', '3', '4'] as const;

/** CLDR-backed text provider used by the locale formatter plug-in. */
export default class CldrDateTimeTextProvider implements TextProvider {
    private readonly cache = new Map<string, LocaleStore | null>();

    constructor() {
        loadCldrData('supplemental/likelySubtags.json');
    }

    getAvailableLocales(): string[] {
        const registered = getRegisteredLocales();
        try {
            if (typeof require !== 'function') {
                return registered;
            }
            const loader = require('cldr-data');
            if (typeof loader !== 'function') {
                return registered;
            }
            const result = loader('availableLocales.json');
            const values = object(result).availableLocales;
            if (!Array.isArray(values)) {
                return registered;
            }
            const locales = values.filter((value): value is string => typeof value === 'string');
            return Array.from(new Set([...locales, ...registered]));
        }
        catch {
            return registered;
        }
    }

    getText(field: TemporalField, value: number, style: TextStyle, locale: Locale): string | null {
        return this.findStore(field, locale)?.getText(value, style) ?? null;
    }

    getTextIterator(
        field: TemporalField,
        style: TextStyle | null,
        locale: Locale,
    ): IterableIterator<TextEntry> | null {
        return this.findStore(field, locale)?.getTextIterator(style) ?? null;
    }

    private findStore(field: TemporalField, locale: Locale): LocaleStore | null {
        const key = `${field.toString()}|${locale.localeString()}`;
        if (this.cache.has(key)) {
            return this.cache.get(key) ?? null;
        }
        const store = this.createStore(field, locale);
        this.cache.set(key, store);
        return store;
    }

    private createStore(field: TemporalField, locale: Locale): LocaleStore | null {
        const localeName = locale.localeString();
        loadCldrData(`main/${localeName}/ca-gregorian.json`);
        const cldr = getOrCreateCldrInstance(localeName);

        if (field === ChronoField.MONTH_OF_YEAR) {
            const source = object(cldr.main('dates/calendars/gregorian/months/format'));
            return store({
                wide: numbered(object(source.wide), MONTH_KEYS, 1),
                narrow: numbered(object(source.narrow), MONTH_KEYS, 1),
                abbreviated: numbered(object(source.abbreviated), MONTH_KEYS, 1),
            });
        }
        if (field === ChronoField.DAY_OF_WEEK) {
            const source = object(cldr.main('dates/calendars/gregorian/days/format'));
            return store({
                wide: named(object(source.wide), DAY_KEYS, 1),
                narrow: named(object(source.narrow), DAY_KEYS, 1),
                abbreviated: named(object(source.abbreviated), DAY_KEYS, 1),
            });
        }
        if (field === ChronoField.AMPM_OF_DAY) {
            const source = object(cldr.main('dates/calendars/gregorian/dayPeriods/format'));
            return store({
                wide: named(object(source.wide), ['am', 'pm'], 0),
                narrow: named(object(source.narrow), ['am', 'pm'], 0),
                abbreviated: named(object(source.abbreviated), ['am', 'pm'], 0),
            });
        }
        if (field === ChronoField.ERA) {
            const source = object(cldr.main('dates/calendars/gregorian/eras'));
            return store({
                wide: numbered(object(source.eraNames), ['0', '1'], 0),
                narrow: numbered(object(source.eraNarrow), ['0', '1'], 0),
                abbreviated: numbered(object(source.eraAbbr), ['0', '1'], 0),
            });
        }
        if (field === IsoFields.QUARTER_OF_YEAR) {
            const source = object(cldr.main('dates/calendars/gregorian/quarters/format'));
            return store({
                wide: numbered(object(source.wide), QUARTER_KEYS, 1),
                narrow: numbered(object(source.narrow), QUARTER_KEYS, 1),
                abbreviated: numbered(object(source.abbreviated), QUARTER_KEYS, 1),
            });
        }
        return null;
    }
}

function object(value: unknown): Json {
    return typeof value === 'object' && value !== null ? value as Json : {};
}

function stringValue(value: unknown): string {
    return typeof value === 'string' ? value : String(value ?? '');
}

function numbered(
    source: Json,
    keys: readonly string[],
    firstValue: number,
): TextMap {
    const result: Record<number, string> = {};
    keys.forEach((key, index) => {
        result[firstValue + index] = stringValue(source[key]);
    });
    return result;
}

function named(
    source: Json,
    keys: readonly string[],
    firstValue: number,
): TextMap {
    return numbered(source, keys, firstValue);
}

function store(source: StyleSource): LocaleStore {
    const map: Record<string, TextMap> = {
        [styleKey(TextStyle.FULL)]: source.wide ?? {},
        [styleKey(TextStyle.NARROW)]: source.narrow ?? {},
        [styleKey(TextStyle.SHORT)]: source.abbreviated ?? {},
    };
    map[styleKey(TextStyle.FULL_STANDALONE)] = map[styleKey(TextStyle.FULL)]!;
    map[styleKey(TextStyle.SHORT_STANDALONE)] = map[styleKey(TextStyle.SHORT)]!;
    map[styleKey(TextStyle.NARROW_STANDALONE)] = map[styleKey(TextStyle.NARROW)]!;
    return new LocaleStore(map satisfies StyleTextMap);
}
