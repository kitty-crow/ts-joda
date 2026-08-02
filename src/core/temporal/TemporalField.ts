import { abstractMethodFail } from '../assert.ts';
import type { Temporal } from './Temporal.ts';
import type { TemporalAccessor } from './TemporalAccessor.ts';
import type { TemporalUnit } from './TemporalUnit.ts';
import type { ResolverStyle } from '../format/ResolverStyle.ts';
import type { ValueRange } from './ValueRange.ts';

export class TemporalField {
    isSupportedBy(_temporal: TemporalAccessor): boolean {
        return abstractMethodFail('TemporalField.isSupportedBy');
    }

    isDateBased(): boolean {
        return abstractMethodFail('TemporalField.isDateBased');
    }

    isTimeBased(): boolean {
        return abstractMethodFail('TemporalField.isTimeBased');
    }

    baseUnit(): TemporalUnit {
        return abstractMethodFail('TemporalField.baseUnit');
    }

    rangeUnit(): TemporalUnit {
        return abstractMethodFail('TemporalField.rangeUnit');
    }

    range(): ValueRange {
        return abstractMethodFail('TemporalField.range');
    }

    rangeRefinedBy(_temporal: TemporalAccessor): ValueRange {
        return abstractMethodFail('TemporalField.rangeRefinedBy');
    }

    getFrom(_temporal: TemporalAccessor): number {
        return abstractMethodFail('TemporalField.getFrom');
    }

    adjustInto<R extends Temporal>(_temporal: R, _newValue: number): R {
        return abstractMethodFail('TemporalField.adjustInto');
    }

    name(): string {
        return abstractMethodFail('TemporalField.name');
    }

    displayName(): string {
        return abstractMethodFail('TemporalField.displayName');
    }

    resolve(
        _fieldValues: Map<TemporalField, number>,
        _partialTemporal: TemporalAccessor,
        _resolverStyle: ResolverStyle,
    ): TemporalAccessor | null {
        return null;
    }

    equals(_other: unknown): boolean {
        return abstractMethodFail('TemporalField.equals');
    }
}
