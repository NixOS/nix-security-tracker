import { DateValue } from '@internationalized/date';
import { DateRangePreset } from './types.mjs';

declare function getDateRangePreset(preset: DateRangePreset, locale: string, timeZone: string): [DateValue, DateValue];

export { getDateRangePreset };
