import data from './data/tzdbData.ts';
import autoPlug from './plugin/auto-plug.ts';
import { MomentZoneRulesProvider } from './rules/MomentZoneRulesProvider.ts';

MomentZoneRulesProvider.loadTzdbData(data);
autoPlug();
