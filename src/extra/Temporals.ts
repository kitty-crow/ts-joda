/**
 * @copyright (c) 2015-present, Philipp Thürwächter & Pattrick Hüper & Michał Sobkiewicz
 * @copyright (c) 2007-present, Stephen Colebourne & Michael Nascimento Santos
 * @license BSD-3-Clause (see LICENSE in the root directory of this source tree)
 */

import {
    ChronoField,
    ChronoUnit,
    DateTimeException,
    DateTimeParseException,
    IsoFields,
    ParsePosition,
    TemporalAdjuster,
    UnsupportedTemporalTypeException,
    type DateTimeFormatter,
    type Temporal,
    type TemporalQuery,
    type TemporalUnit,
} from '@js-joda/core';
import { requireNonNull } from './assert.ts';
import { MathUtil } from './math.ts';

interface Adjusters {
    NEXT_WORKING: TemporalAdjuster;
    NEXT_WORKING_OR_SAME: TemporalAdjuster;
    PREVIOUS_WORKING: TemporalAdjuster;
    PREVIOUS_WORKING_OR_SAME: TemporalAdjuster;
}

const Adjuster = {} as Adjusters;

/** Additional utilities for working with temporal classes. */
export class Temporals {
    static nextWorkingDay(): TemporalAdjuster {
        return Adjuster.NEXT_WORKING;
    }

    static nextWorkingDayOrSame(): TemporalAdjuster {
        return Adjuster.NEXT_WORKING_OR_SAME;
    }

    static previousWorkingDay(): TemporalAdjuster {
        return Adjuster.PREVIOUS_WORKING;
    }

    static previousWorkingDayOrSame(): TemporalAdjuster {
        return Adjuster.PREVIOUS_WORKING_OR_SAME;
    }

    static parseFirstMatching<T>(
        text: string,
        query: TemporalQuery<T>,
        ...formatters: DateTimeFormatter[]
    ): T {
        requireNonNull(text, 'text');
        requireNonNull(query, 'query');
        requireNonNull(formatters, 'formatters');
        if (formatters.length === 0) {
            throw new DateTimeParseException('No formatters specified', text, 0);
        }
        if (formatters.length === 1) {
            return formatters[0]!.parse(text, query);
        }
        for (const formatter of formatters) {
            try {
                const position = new ParsePosition(0);
                formatter.parseUnresolved(text, position);
                if (position.getErrorIndex() === -1 && position.getIndex() === text.length) {
                    return formatter.parse(text, query);
                }
            } catch {
                // Try the next formatter.
            }
        }
        throw new DateTimeParseException(`Text '${text}' could not be parsed`, text, 0);
    }

    static convertAmount(amount: number, fromUnit: TemporalUnit, toUnit: TemporalUnit): number[] {
        requireNonNull(fromUnit, 'fromUnit');
        requireNonNull(toUnit, 'toUnit');
        Temporals._validateUnit(fromUnit);
        Temporals._validateUnit(toUnit);
        if (fromUnit === toUnit) {
            return [amount, 0];
        }

        if (Temporals._isPrecise(fromUnit) && Temporals._isPrecise(toUnit)) {
            const fromNanos = fromUnit.duration().toNanos();
            const toNanos = toUnit.duration().toNanos();
            if (fromNanos > toNanos) {
                const multiple = MathUtil.intDiv(fromNanos, toNanos);
                return [MathUtil.safeMultiply(amount, multiple), 0];
            }
            const multiple = MathUtil.intDiv(toNanos, fromNanos);
            return [MathUtil.intDiv(amount, multiple), MathUtil.intMod(amount, multiple)];
        }

        const fromMonthFactor = Temporals._monthMonthFactor(fromUnit, fromUnit, toUnit);
        const toMonthFactor = Temporals._monthMonthFactor(toUnit, fromUnit, toUnit);
        if (fromMonthFactor > toMonthFactor) {
            const multiple = MathUtil.intDiv(fromMonthFactor, toMonthFactor);
            return [MathUtil.safeMultiply(amount, multiple), 0];
        }
        const multiple = MathUtil.intDiv(toMonthFactor, fromMonthFactor);
        return [MathUtil.intDiv(amount, multiple), MathUtil.intMod(amount, multiple)];
    }

    static _validateUnit(unit: TemporalUnit): void {
        if (unit instanceof ChronoUnit) {
            if (unit === ChronoUnit.ERAS || unit === ChronoUnit.FOREVER) {
                throw new UnsupportedTemporalTypeException(`Unsupported TemporalUnit: ${unit}`);
            }
            return;
        }
        if (unit !== IsoFields.QUARTER_YEARS) {
            throw new UnsupportedTemporalTypeException(`Unsupported TemporalUnit: ${unit}`);
        }
    }

    static _isPrecise(unit: TemporalUnit): boolean {
        return unit instanceof ChronoUnit && unit.compareTo(ChronoUnit.WEEKS) <= 0;
    }

    static _monthMonthFactor(
        unit: TemporalUnit,
        fromUnit: TemporalUnit,
        toUnit: TemporalUnit,
    ): number {
        if (unit instanceof ChronoUnit) {
            switch (unit) {
                case ChronoUnit.MONTHS:
                    return 1;
                case ChronoUnit.YEARS:
                    return 12;
                case ChronoUnit.DECADES:
                    return 120;
                case ChronoUnit.CENTURIES:
                    return 1200;
                case ChronoUnit.MILLENNIA:
                    return 12000;
                default:
                    throw new DateTimeException(
                        `Unable to convert between units: ${fromUnit} to ${toUnit}`,
                    );
            }
        }
        return 3;
    }

    constructor() {}
}

export function _init(): void {
    Adjuster.NEXT_WORKING = new class extends TemporalAdjuster {
        override adjustInto<T extends Temporal>(temporal: T): T {
            switch (temporal.get(ChronoField.DAY_OF_WEEK)) {
                case 6:
                    return temporal.plus(2, ChronoUnit.DAYS);
                case 5:
                    return temporal.plus(3, ChronoUnit.DAYS);
                default:
                    return temporal.plus(1, ChronoUnit.DAYS);
            }
        }
    }();

    Adjuster.PREVIOUS_WORKING = new class extends TemporalAdjuster {
        override adjustInto<T extends Temporal>(temporal: T): T {
            switch (temporal.get(ChronoField.DAY_OF_WEEK)) {
                case 1:
                    return temporal.minus(3, ChronoUnit.DAYS);
                case 7:
                    return temporal.minus(2, ChronoUnit.DAYS);
                default:
                    return temporal.minus(1, ChronoUnit.DAYS);
            }
        }
    }();

    Adjuster.NEXT_WORKING_OR_SAME = new class extends TemporalAdjuster {
        override adjustInto<T extends Temporal>(temporal: T): T {
            switch (temporal.get(ChronoField.DAY_OF_WEEK)) {
                case 6:
                    return temporal.plus(2, ChronoUnit.DAYS);
                case 7:
                    return temporal.plus(1, ChronoUnit.DAYS);
                default:
                    return temporal;
            }
        }
    }();

    Adjuster.PREVIOUS_WORKING_OR_SAME = new class extends TemporalAdjuster {
        override adjustInto<T extends Temporal>(temporal: T): T {
            switch (temporal.get(ChronoField.DAY_OF_WEEK)) {
                case 6:
                    return temporal.minus(1, ChronoUnit.DAYS);
                case 7:
                    return temporal.minus(2, ChronoUnit.DAYS);
                default:
                    return temporal;
            }
        }
    }();
}
