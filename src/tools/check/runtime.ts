import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { packageDir } from '../config.ts';

const require = createRequire(import.meta.url);

interface Core {
    readonly LocalDate: {
        parse(value: string): {
            plusDays(days: number): { toString(): string };
            toString(): string;
        };
    };
    readonly ZoneId: { of(value: string): unknown };
}

interface Extra {
    readonly YearQuarter: { of(year: number, quarter: number): { toString(): string } };
}

interface Locale {
    readonly Locale: { ENGLISH: unknown };
    readonly registerLocaleData: (path: string, data: unknown) => void;
}

export async function checkRuntime(): Promise<void> {
    const core = require(resolve(packageDir, 'core')) as Core;
    const date = core.LocalDate.parse('2026-08-02');
    if (date.plusDays(1).toString() !== '2026-08-03') {
        throw new Error('Core date arithmetic smoke check failed');
    }

    const extra = require(resolve(packageDir, 'extra')) as Extra;
    if (extra.YearQuarter.of(2026, 3).toString() !== '2026-Q3') {
        throw new Error('Extra package smoke check failed');
    }

    require(resolve(packageDir, 'timezone')) as unknown;
    core.ZoneId.of('Europe/London');

    const locale = require(resolve(packageDir, 'locale')) as Locale;
    if (locale.Locale.ENGLISH === undefined || typeof locale.registerLocaleData !== 'function') {
        throw new Error('Locale package smoke check failed');
    }

    const deep = await import(pathToFileURL(resolve(packageDir, 'core/src/LocalDate.js')).href) as {
        readonly LocalDate: Core['LocalDate'];
    };
    if (typeof deep.LocalDate !== 'function') {
        throw new Error('Generated deep import smoke check failed');
    }
}
