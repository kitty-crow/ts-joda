import * as core from '@js-joda/core';

interface MathOps {
    intDiv(x: number, y: number): number;
    intMod(x: number, y: number): number;
    safeMultiply(x: number, y: number): number;
    safeToInt(value: number): number;
}

interface CoreInternal {
    readonly _: {
        readonly MathUtil: MathOps;
    };
}

export const MathUtil = (core as typeof core & CoreInternal)._.MathUtil;
