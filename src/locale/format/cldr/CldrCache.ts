/*
 * @copyright (c) 2020, Philipp Thuerwaechter & Pattrick Hueper
 * @license BSD-3-Clause (see LICENSE.md in the root directory of this source tree)
 */

import Cldr from 'cldrjs';

declare const require: (id: string) => unknown;

type CldrLoader = (path: string) => unknown;

interface MapZone {
    readonly _other: string;
    readonly _territory: string;
    readonly _type: string;
}

interface MetaZone {
    readonly mapZone?: MapZone;
}

export type MapZones = Record<string, Record<string, string>>;

const cldrDataLoaded = new Set<string>();
const registeredLocales = new Set<string>();
const localeToCldrInstanceCache: Record<string, Cldr> = {};
const localeToMapZonesCache: Record<string, MapZones> = {};

export function registerLocaleData(path: string, data: unknown): void {
    if (cldrDataLoaded.has(path)) {
        return;
    }

    cldrDataLoaded.add(path);
    const locale = path.match(/^main\/([^/]+)\//)?.[1];
    if (locale !== undefined) {
        registeredLocales.add(locale);
    }
    Cldr.load(data);
}

export function getRegisteredLocales(): string[] {
    return Array.from(registeredLocales);
}

/** @private */
export function loadCldrData(path: string): void {
    if (cldrDataLoaded.has(path)) {
        return;
    }

    try {
        const cldrData = require('cldr-data') as CldrLoader;
        registerLocaleData(path, cldrData(path));
    } catch {
        // Optional dependency absent. Prebuilt packages register their data directly.
    }
}

/** @private */
export function getOrCreateCldrInstance(locale: string): Cldr {
    const cached = localeToCldrInstanceCache[locale];
    if (cached !== undefined) {
        return cached;
    }

    const cldr = new Cldr(locale);
    localeToCldrInstanceCache[locale] = cldr;
    return cldr;
}

/** @private */
export function getOrCreateMapZones(cldr: Cldr): MapZones {
    const cached = localeToMapZonesCache[cldr.locale];
    if (cached !== undefined) {
        return cached;
    }

    const zones: MapZones = {};
    const metaZones = cldr.get('supplemental/metaZones/metazones') as readonly MetaZone[];
    for (const metaZone of metaZones) {
        const map = metaZone.mapZone;
        if (map === undefined) {
            continue;
        }

        const territory = zones[map._other] ?? {};
        territory[map._territory] = map._type;
        zones[map._other] = territory;
    }

    localeToMapZonesCache[cldr.locale] = zones;
    return zones;
}
