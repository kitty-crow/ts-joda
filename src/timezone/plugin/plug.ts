import { ZoneId, ZoneRulesProvider } from '@js-joda/core';
import type { PackedTzdb } from '../model.ts';
import { MomentZoneRulesProvider } from '../rules/MomentZoneRulesProvider.ts';
import extendSystemDefaultZoneId from './system-default-zone.ts';

type Provider = typeof ZoneRulesProvider & {
    getTzdbData(): PackedTzdb | undefined;
    loadTzdbData(data: PackedTzdb): void;
};

export interface CoreApi {
    readonly ZoneId: typeof ZoneId;
    readonly ZoneRulesProvider: typeof ZoneRulesProvider;
}

export default function plug(core: CoreApi): CoreApi {
    const provider = core.ZoneRulesProvider as Provider;
    provider.getRules = MomentZoneRulesProvider.getRules;
    provider.getAvailableZoneIds = MomentZoneRulesProvider.getAvailableZoneIds;
    provider.getTzdbData = MomentZoneRulesProvider.getTzdbData;
    provider.loadTzdbData = MomentZoneRulesProvider.loadTzdbData;
    extendSystemDefaultZoneId(core.ZoneId);
    return core;
}
