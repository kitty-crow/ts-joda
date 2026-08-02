import { resolve } from 'node:path';

export const root = resolve(process.cwd());
export const buildDir = resolve(root, '.build/work');
export const packageDir = resolve(root, 'packages');

export interface PackageConfig {
    readonly id: 'core' | 'extra' | 'locale' | 'timezone';
    readonly name: string;
    readonly entry: string;
    readonly global: string;
    readonly file: string;
    readonly external: readonly string[];
    readonly globals: Readonly<Record<string, string>>;
}

export const packages: readonly PackageConfig[] = [
    {
        id: 'core',
        name: '@js-joda/core',
        entry: 'js-joda.js',
        global: 'JSJoda',
        file: 'js-joda',
        external: [],
        globals: {},
    },
    {
        id: 'extra',
        name: '@js-joda/extra',
        entry: 'js-joda-extra.js',
        global: 'JSJodaExtra',
        file: 'js-joda-extra',
        external: ['@js-joda/core'],
        globals: { '@js-joda/core': 'JSJoda' },
    },
    {
        id: 'timezone',
        name: '@js-joda/timezone',
        entry: 'js-joda-timezone.js',
        global: 'JSJodaTimezone',
        file: 'js-joda-timezone',
        external: ['@js-joda/core'],
        globals: { '@js-joda/core': 'JSJoda' },
    },
    {
        id: 'locale',
        name: '@js-joda/locale',
        entry: 'js-joda-locale.js',
        global: 'JSJodaLocale',
        file: 'js-joda-locale',
        external: ['@js-joda/core', '@js-joda/timezone', 'cldr-data'],
        globals: {
            '@js-joda/core': 'JSJoda',
            '@js-joda/timezone': 'JSJodaTimezone',
            'cldr-data': 'cldrData',
        },
    },
] as const;

export const timezoneVariants = [
    '',
    '-10-year-range',
    '-1970-2030',
    '-2012-2022',
    '-2017-2027',
    '-empty',
] as const;

export const localePackages: Readonly<Record<string, readonly string[]>> = {
    ar: ['ar.*'],
    cs: ['cs.*'],
    da: ['da.*'],
    de: ['de.*'],
    'de-de': ['de', 'de-DE'],
    el: ['el.*'],
    en: ['en.*'],
    'en-gb': ['en', 'en-GB'],
    'en-us': ['en', 'en-US'],
    es: ['es.*'],
    fi: ['fi.*'],
    'fi-fi': ['fi', 'fi-FI'],
    fr: ['fr.*'],
    'fr-fr': ['fr', 'fr-FR'],
    hi: ['hi.*'],
    it: ['it.*'],
    'it-it': ['it', 'it-IT'],
    ja: ['ja.*'],
    'ja-jp': ['ja', 'ja-JP'],
    ko: ['ko.*'],
    lt: ['lt.*'],
    'nb-no': ['nb', 'nb-NO'],
    'nn-no': ['nn', 'nn-NO'],
    no: ['no.*'],
    pl: ['pl.*'],
    ro: ['ro.*'],
    ru: ['ru.*'],
    sk: ['sk.*'],
    sv: ['sv.*'],
    'sv-se': ['sv', 'sv-SE'],
    tr: ['tr.*'],
    uk: ['uk.*'],
    zh: ['zh.*'],
};
