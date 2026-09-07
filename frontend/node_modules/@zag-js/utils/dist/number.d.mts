declare const isNaN: (v: number) => boolean;
declare const nan: (v: number) => number;
declare const mod: (v: number, m: number) => number;
declare const wrap: (v: number, vmax: number) => number;
declare const getMinValueAtIndex: (i: number, v: number[], vmin: number) => number;
declare const getMaxValueAtIndex: (i: number, v: number[], vmax: number) => number;
declare const isValueAtMax: (v: number, vmax: number) => boolean;
declare const isValueAtMin: (v: number, vmin: number) => boolean;
declare const isValueWithinRange: (v: number, vmin: number | null | undefined, vmax: number | null | undefined) => boolean;
declare const roundValue: (v: number, vmin: number, step: number) => number;
declare const clampValue: (v: number, vmin: number, vmax: number) => number;
declare const clampPercent: (v: number) => number;
declare const getValuePercent: (v: number, vmin: number, vmax: number) => number;
declare const getPercentValue: (p: number, vmin: number, vmax: number, step: number) => number;
declare const roundToStepPrecision: (v: number, step: number) => number;
declare const roundToDpr: (v: number, dpr: unknown) => number;
declare const snapValueToStep: (v: number, vmin: number | undefined, vmax: number | undefined, step: number) => number;
declare const setValueAtIndex: <T>(vs: T[], i: number, v: T) => T[];
interface RangeContext {
    min: number;
    max: number;
    step: number;
    values: number[];
}
declare function getValueSetterAtIndex(index: number, ctx: RangeContext): (value: number) => number[];
declare function getNextStepValue(index: number, ctx: RangeContext): number[];
declare function getPreviousStepValue(index: number, ctx: RangeContext): number[];
declare const getClosestValueIndex: (vs: number[], t: number) => number;
declare const getClosestValue: (vs: number[], t: number) => number;
declare const getValueRanges: (vs: number[], vmin: number, vmax: number, gap: number) => {
    min: number;
    max: number;
    value: number;
}[];
declare const getValueTransformer: (va: number[], vb: number[]) => (v: number) => number;
declare const toFixedNumber: (v: number, d?: number, b?: number) => number;
declare const incrementValue: (v: number, s: number) => number;
declare const decrementValue: (v: number, s: number) => number;
declare const toPx: (v: number | string | undefined) => string | undefined;

export { clampPercent, clampValue, decrementValue, getClosestValue, getClosestValueIndex, getMaxValueAtIndex, getMinValueAtIndex, getNextStepValue, getPercentValue, getPreviousStepValue, getValuePercent, getValueRanges, getValueSetterAtIndex, getValueTransformer, incrementValue, isNaN, isValueAtMax, isValueAtMin, isValueWithinRange, mod, nan, roundToDpr, roundToStepPrecision, roundValue, setValueAtIndex, snapValueToStep, toFixedNumber, toPx, wrap };
