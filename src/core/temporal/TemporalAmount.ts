import { abstractMethodFail } from '../assert.ts';
import type { Temporal } from './Temporal.ts';
import type { TemporalUnit } from './TemporalUnit.ts';

export class TemporalAmount {
    get(_unit: TemporalUnit): number {
        return abstractMethodFail('TemporalAmount.get');
    }

    units(): TemporalUnit[] {
        return abstractMethodFail('TemporalAmount.units');
    }

    addTo<T extends Temporal>(_temporal: T): T {
        return abstractMethodFail('TemporalAmount.addTo');
    }

    subtractFrom<T extends Temporal>(_temporal: T): T {
        return abstractMethodFail('TemporalAmount.subtractFrom');
    }

    [Symbol.toPrimitive](hint: string): string {
        if (hint !== 'number') {
            return this.toString();
        }
        throw new TypeError(
            'A conversion from TemporalAmount to a number is not allowed. ' +
            'To compare use the methods .equals(), .compareTo(), .isBefore() ' +
            'or one that is more suitable to your use case.',
        );
    }
}
