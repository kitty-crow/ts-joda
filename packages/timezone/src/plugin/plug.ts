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
    readonly ZoneRulesProvider: Provider;
}

export default function plug(core: CoreApi): CoreApi {
    core.ZoneRulesProvider.getRules = MomentZoneRulesProvider.getRules;
    core.ZoneRulesProvider.getAvailableZoneIds = MomentZoneRulesProvider.getAvailableZoneIds;
    core.ZoneRulesProvider.getTzdbData = MomentZoneRulesProvider.getTzdbData;
    core.ZoneRulesProvider.loadTzdbData = MomentZoneRulesProvider.loadTzdbData;
    extendSystemDefaultZoneId(core.ZoneId);
    return core;
}
