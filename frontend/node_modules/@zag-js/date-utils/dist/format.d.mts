import { DateFormatter } from '@internationalized/date';
import { DateValue } from './types.mjs';

declare function formatRange(startDate: DateValue, endDate: DateValue, formatter: DateFormatter, toString: (start: string, end: string) => string, timeZone: string): string;
declare function formatSelectedDate(startDate: DateValue | null | undefined, endDate: DateValue | null, locale: string, timeZone: string): string;
declare function formatVisibleRange(startDate: DateValue, endDate: DateValue | null, locale: string, timeZone: string): string;

export { formatRange, formatSelectedDate, formatVisibleRange };
