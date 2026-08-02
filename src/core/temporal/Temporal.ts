import { abstractMethodFail, assert, requireInstance, requireNonNull } from '../assert.ts';
import { IllegalArgumentException } from '../errors.ts';
import { TemporalAccessor } from './TemporalAccessor.ts';
import { TemporalAdjuster } from './TemporalAdjuster.ts';
import { TemporalAmount } from './TemporalAmount.ts';
import { TemporalField } from './TemporalField.ts';
import { TemporalUnit } from './TemporalUnit.ts';

export abstract class Temporal extends TemporalAccessor {
    isSupported(field: TemporalField): boolean;
    isSupported(unit: TemporalUnit): boolean;
    override isSupported(_fieldOrUnit: TemporalField | TemporalUnit): boolean {
        return abstractMethodFail('Temporal.isSupported');
    }

    minus(amount: TemporalAmount): this;
    minus(amount: number, unit: TemporalUnit): this;
    minus(amount: TemporalAmount | number, unit?: TemporalUnit): this {
        return (unit === undefined
            ? this._minusAmount(amount as TemporalAmount)
            : this._minusUnit(amount as number, unit)) as this;
    }

    _minusAmount(amount: TemporalAmount): Temporal {
        requireNonNull(amount, 'amount');
        requireInstance(amount, TemporalAmount, 'amount');
        return amount.subtractFrom(this);
    }

    _minusUnit(amountToSubtract: number, unit: TemporalUnit): Temporal {
        requireNonNull(unit, 'unit');
        requireInstance(unit, TemporalUnit, 'unit');
        return this._plusUnit(-amountToSubtract, unit);
    }

    plus(amount: TemporalAmount): this;
    plus(amount: number, unit: TemporalUnit): this;
    plus(amount: TemporalAmount | number, unit?: TemporalUnit): this {
        return (unit === undefined
            ? this._plusAmount(amount as TemporalAmount)
            : this._plusUnit(amount as number, unit)) as this;
    }

    _plusAmount(amount: TemporalAmount): Temporal {
        requireNonNull(amount, 'amount');
        requireInstance(amount, TemporalAmount, 'amount');
        return amount.addTo(this);
    }

    _plusUnit(_amountToAdd: number, _unit: TemporalUnit): Temporal {
        return abstractMethodFail('Temporal._plusUnit');
    }

    until(_endTemporal: Temporal, _unit: TemporalUnit): number {
        return abstractMethodFail('Temporal.until');
    }

    with(adjuster: TemporalAdjuster): this;
    with(field: TemporalField, newValue: number): this;
    with(adjusterOrField: TemporalAdjuster | TemporalField, newValue?: number): this {
        return (newValue === undefined
            ? this._withAdjuster(adjusterOrField as TemporalAdjuster)
            : this._withField(adjusterOrField as TemporalField, newValue)) as this;
    }

    _withAdjuster(adjuster: TemporalAdjuster): Temporal {
        requireNonNull(adjuster, 'adjuster');
        assert(
            typeof adjuster.adjustInto === 'function',
            'adjuster must be a TemporalAdjuster',
            IllegalArgumentException,
        );
        return adjuster.adjustInto(this);
    }

    _withField(_field: TemporalField, _newValue: number): Temporal {
        return abstractMethodFail('Temporal._withField');
    }

    [Symbol.toPrimitive](hint: string): string {
        if (hint !== 'number') {
            return this.toString();
        }
        throw new TypeError(
            'A conversion from Temporal to a number is not allowed. ' +
            'To compare use the methods .equals(), .compareTo(), .isBefore() ' +
            'or one that is more suitable to your use case.',
        );
    }
}
