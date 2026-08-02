import { abstractMethodFail } from '../assert.ts';
import { Enum } from '../Enum.ts';
import type { TemporalAccessor } from './TemporalAccessor.ts';

export class TemporalQuery<R> extends Enum {
    queryFrom(_temporal: TemporalAccessor): R {
        return abstractMethodFail('TemporalQuery.queryFrom');
    }
}

export function createTemporalQuery<R>(
    name: string,
    query: (temporal: TemporalAccessor) => R,
): TemporalQuery<R> {
    return new class extends TemporalQuery<R> {
        override queryFrom(temporal: TemporalAccessor): R {
            return query(temporal);
        }
    }(name);
}
