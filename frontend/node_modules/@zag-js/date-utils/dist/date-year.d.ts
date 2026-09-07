import { DateValue } from '@internationalized/date';

interface YearsRange {
    from: number;
    to: number;
}
declare function getYearsRange(range: YearsRange): number[];
declare function getDefaultYearRange(referenceDate: DateValue, min?: DateValue, max?: DateValue): YearsRange;
declare function normalizeYear(year: string | null | undefined): string | undefined;
declare function getDecadeRange(year: number, opts?: {
    strict?: boolean;
}): number[];

export { type YearsRange, getDecadeRange, getDefaultYearRange, getYearsRange, normalizeYear };
