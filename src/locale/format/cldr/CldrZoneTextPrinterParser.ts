import Cldr from 'cldrjs';
import {
    TextStyle,
    TemporalQueries,
    ZoneId,
    ZoneOffset,
    ZoneRulesProvider,
} from '@js-joda/core';
import type Locale from '../../Locale.ts';
import type { ParseContext, PrintContext, TextBuffer } from '../../core-types.ts';
import {
    getOrCreateCldrInstance,
    getOrCreateMapZones,
    loadCldrData,
} from './CldrCache.ts';

type ZoneStyle = 'long' | 'short';
type ZoneType = 'daylight' | 'standard' | 'generic';
type Json = Record<string, unknown>;

interface ZoneNames {
    readonly ids: Readonly<Record<string, string>>;
    readonly sortedKeys: readonly string[];
}

const byLongest = (first: string, second: string): number =>
    second.length - first.length || first.localeCompare(second);

/** Prints and parses CLDR time-zone names. */
export default class CldrZoneTextPrinterParser {
    private readonly textCache = new Map<string, string | null>();
    private readonly zoneNames = new Map<string, ZoneNames>();

    constructor(private readonly textStyle: TextStyle) {
        loadCldrData('supplemental/likelySubtags.json');
        loadCldrData('supplemental/metaZones.json');
    }

    print(context: PrintContext, buffer: TextBuffer): boolean {
        const zone = context.getValueQuery(TemporalQueries.zoneId());
        if (zone === null) {
            return false;
        }
        if (zone.normalized() instanceof ZoneOffset) {
            buffer.append(zone.id());
            return true;
        }

        const locale = context.locale() as Locale;
        const style: ZoneStyle = this.textStyle.asNormal() === TextStyle.FULL ? 'long' : 'short';
        loadCldrData(`main/${locale.localeString()}/timeZoneNames.json`);
        const cldr = getOrCreateCldrInstance(locale.localeString());
        buffer.append(this.resolveText(cldr, zone.id(), style, 'generic') ?? zone.id());
        return true;
    }

    parse(context: ParseContext, text: string, position: number): number {
        for (const name of ['UTC', 'GMT']) {
            if (context.subSequenceEquals(text, position, name, 0, name.length)) {
                context.setParsedZone(ZoneId.of(name));
                return position + name.length;
            }
        }

        const locale = context.locale() as Locale;
        const { ids, sortedKeys } = this.resolveZoneNames(locale.localeString());
        for (const name of sortedKeys) {
            if (context.subSequenceEquals(text, position, name, 0, name.length)) {
                const id = ids[name];
                if (id !== undefined) {
                    context.setParsedZone(ZoneId.of(id));
                    return position + name.length;
                }
            }
        }
        return ~position;
    }

    overrideToString(): string {
        return `ZoneText(${this.textStyle})`;
    }

    toString(): string {
        return this.overrideToString();
    }

    private resolveText(
        cldr: Cldr,
        zoneId: string,
        style: ZoneStyle,
        type: ZoneType,
    ): string | null {
        const key = `${cldr.locale}|${zoneId}|${style}|${type}`;
        if (this.textCache.has(key)) {
            return this.textCache.get(key) ?? null;
        }
        const text = this.findText(cldr, zoneId, style, type, new Set());
        this.textCache.set(key, text);
        return text;
    }

    private findText(
        cldr: Cldr,
        zoneId: string,
        style: ZoneStyle,
        type: ZoneType,
        visited: Set<string>,
    ): string | null {
        if (visited.has(zoneId)) {
            return null;
        }
        visited.add(zoneId);

        const direct = stringOrNull(cldr.main(`dates/timeZoneNames/zone/${zoneId}/${style}/${type}`));
        if (direct !== null) {
            return direct;
        }

        const info = cldr.get(`supplemental/metaZones/metazoneInfo/timezone/${zoneId}`);
        const entries = Array.isArray(info) ? info : [];
        const latest = entries[entries.length - 1];
        const metaZone = stringOrNull(object(object(latest).usesMetazone)._mzone);
        if (metaZone === null) {
            return null;
        }

        for (const candidate of [type, 'generic', 'standard'] as const) {
            const value = stringOrNull(
                cldr.main(`dates/timeZoneNames/metazone/${metaZone}/${style}/${candidate}`),
            );
            if (value !== null) {
                return value;
            }
        }

        const zones = getOrCreateMapZones(cldr)[metaZone];
        if (zones === undefined) {
            return null;
        }
        const preferred = zones[cldr.attributes.territory] ?? zones['001'];
        return preferred === undefined
            ? null
            : this.findText(cldr, preferred, style, type, visited);
    }

    private resolveZoneNames(localeName: string): ZoneNames {
        const cached = this.zoneNames.get(localeName);
        if (cached !== undefined) {
            return cached;
        }

        const ids: Record<string, string> = {};
        loadCldrData(`main/${localeName}/timeZoneNames.json`);
        const cldr = getOrCreateCldrInstance(localeName);
        const style: ZoneStyle = this.textStyle.asNormal() === TextStyle.FULL ? 'long' : 'short';

        for (const id of ZoneRulesProvider.getAvailableZoneIds()) {
            ids[id] = id;
            for (const type of ['generic', 'standard', 'daylight'] as const) {
                const text = this.resolveText(cldr, id, style, type);
                if (text !== null) {
                    ids[text] = id;
                }
            }
        }

        const result: ZoneNames = {
            ids,
            sortedKeys: Object.keys(ids).sort(byLongest),
        };
        this.zoneNames.set(localeName, result);
        return result;
    }
}

function object(value: unknown): Json {
    return typeof value === 'object' && value !== null ? value as Json : {};
}

function stringOrNull(value: unknown): string | null {
    return typeof value === 'string' && value.length > 0 ? value : null;
}
