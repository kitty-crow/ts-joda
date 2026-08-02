import * as core from '@js-joda/core';

interface MathOps {
    safeToInt(value: number): number;
}

interface CoreInternal {
    readonly _: {
        readonly MathUtil: MathOps;
    };
}

export const MathUtil = (core as typeof core & CoreInternal)._.MathUtil;
