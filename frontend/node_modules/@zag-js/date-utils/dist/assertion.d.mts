import { DateValue, DateAvailableFn } from './types.mjs';
import '@internationalized/date';

declare function isDateEqual(dateA: DateValue | null | undefined, dateB?: DateValue | null): boolean;
declare function isDateUnavailable(date: DateValue | null, isUnavailable: DateAvailableFn | undefined, locale: string, minValue?: DateValue | null, maxValue?: DateValue | null): boolean;
declare function isDateOutsideRange(date: DateValue, startDate?: DateValue | null, endDate?: DateValue | null): boolean;
declare function isPreviousRangeInvalid(startDate: DateValue, minValue?: DateValue | null, maxValue?: DateValue | null): boolean;
declare function isNextRangeInvalid(endDate: DateValue, minValue?: DateValue | null, maxValue?: DateValue | null): boolean;

export { isDateEqual, isDateOutsideRange, isDateUnavailable, isNextRangeInvalid, isPreviousRangeInvalid };
