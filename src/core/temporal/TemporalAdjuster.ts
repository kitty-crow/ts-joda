import { abstractMethodFail } from '../assert.ts';
import type { Temporal } from './Temporal.ts';

export class TemporalAdjuster {
    adjustInto<T extends Temporal>(_temporal: T): T {
        return abstractMethodFail('TemporalAdjuster.adjustInto');
    }
}
