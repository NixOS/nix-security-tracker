/**
 * This code was modified from react-resizable-panels by Brian Vaughn
 * @see https://github.com/bvaughn/react-resizable-panels
 */
declare const PRECISION = 10;
declare function fuzzyCompareNumbers(actual: number, expected: number, fractionDigits?: number): number;
declare function fuzzyNumbersEqual(actual: number | undefined, expected: number | undefined, fractionDigits?: number): boolean;
declare function fuzzySizeEqual(actual: number[], expected: number[], fractionDigits?: number): boolean;

export { PRECISION, fuzzyCompareNumbers, fuzzyNumbersEqual, fuzzySizeEqual };
