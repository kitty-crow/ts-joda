import { DateTimeException, ZoneRulesProvider, type ZoneRules } from '@js-joda/core';
import { unpack } from '../data/unpack.ts';
import type { PackedTzdb, ZoneInfo } from '../model.ts';
import { MomentZoneRules } from './MomentZoneRules.ts';

let data: PackedTzdb | undefined;
let version: string | undefined;
const ids: string[] = [];
const zones: Record<string, ZoneInfo> = {};
const links: Record<string, string> = {};

export class MomentZoneRulesProvider extends ZoneRulesProvider {
    static override getRules(zoneId: string): ZoneRules {
        const target = links[zoneId];
        const info = target === undefined ? undefined : zones[target];
        if (info === undefined) {
            throw new DateTimeException(`Unknown time-zone ID: ${zoneId}`);
        }
        return new MomentZoneRules(info);
    }

    static override getAvailableZoneIds(): string[] {
        return ids;
    }

    static getVersion(): string | undefined {
        return version;
    }

    static getTzdbData(): PackedTzdb | undefined {
        return data;
    }

    static loadTzdbData(packed: PackedTzdb): void {
        data = packed;
        version = packed.version;

        for (const packedZone of packed.zones) {
            const info = unpack(packedZone);
            ids.push(info.name);
            zones[info.name] = info;
            links[info.name] = info.name;
        }

        for (const packedLink of packed.links) {
            const [target, alias] = packedLink.split('|');
            if (target === undefined || alias === undefined) {
                throw new TypeError(`Invalid packed time-zone link: ${packedLink}`);
            }
            ids.push(alias);
            links[alias] = target;
        }
    }
}
