import * as core from '@js-joda/core';

interface MathOps {
    readonly MIN_SAFE_INTEGER?: number;
    floorDiv(x: number, y: number): number;
    floorMod(x: number, y: number): number;
    intDiv(x: number, y: number): number;
    intMod(x: number, y: number): number;
    safeAdd(x: number, y: number): number;
    safeMultiply(x: number, y: number): number;
    safeSubtract(x: number, y: number): number;
    safeToInt(value: number): number;
    verifyInt(value: number): void;
}

interface CoreInternal {
    readonly _: {
        readonly MathUtil: MathOps;
    };
}

export const MathUtil = (core as typeof core & CoreInternal)._.MathUtil;
