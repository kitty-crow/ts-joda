import { abstractMethodFail } from '../assert.ts';
import { UnsupportedTemporalTypeException } from '../errors.ts';
import { ChronoField } from './ChronoField.ts';
import type { TemporalField } from './TemporalField.ts';
import { TemporalQueries } from './TemporalQueries.ts';
import type { TemporalQuery } from './TemporalQuery.ts';
import type { ValueRange } from './ValueRange.ts';

export class TemporalAccessor {
    query<R>(query: TemporalQuery<R>): R | null {
        if (
            query === TemporalQueries.zoneId()
            || query === TemporalQueries.chronology()
            || query === TemporalQueries.precision()
        ) {
            return null;
        }
        return query.queryFrom(this);
    }

    get(field: TemporalField): number {
        return this.range(field).checkValidIntValue(this.getLong(field), field);
    }

    getLong(_field: TemporalField): number {
        return abstractMethodFail('TemporalAccessor.getLong');
    }

    range(field: TemporalField): ValueRange {
        if (field instanceof ChronoField) {
            if (this.isSupported(field)) {
                return field.range();
            }
            throw new UnsupportedTemporalTypeException(`Unsupported field: ${field}`);
        }
        return field.rangeRefinedBy(this);
    }

    isSupported(_field: TemporalField): boolean {
        return abstractMethodFail('TemporalAccessor.isSupported');
    }
}
