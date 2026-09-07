import { DateValue } from '@internationalized/date';
import { DateRangePreset } from './types.js';

declare function getDateRangePreset(preset: DateRangePreset, locale: string, timeZone: string): [DateValue, DateValue];

export { getDateRangePreset };
