import { abstractMethodFail } from '../assert.ts';
import type { Duration } from '../Duration.ts';
import type { Temporal } from './Temporal.ts';

export class TemporalUnit {
    duration(): Duration {
        return abstractMethodFail('TemporalUnit.duration');
    }

    isDurationEstimated(): boolean {
        return abstractMethodFail('TemporalUnit.isDurationEstimated');
    }

    isDateBased(): boolean {
        return abstractMethodFail('TemporalUnit.isDateBased');
    }

    isTimeBased(): boolean {
        return abstractMethodFail('TemporalUnit.isTimeBased');
    }

    isSupportedBy(_temporal: Temporal): boolean {
        return abstractMethodFail('TemporalUnit.isSupportedBy');
    }

    addTo<T extends Temporal>(_temporal: T, _amount: number): T {
        return abstractMethodFail('TemporalUnit.addTo');
    }

    between(_temporal1: Temporal, _temporal2: Temporal): number {
        return abstractMethodFail('TemporalUnit.between');
    }
}
