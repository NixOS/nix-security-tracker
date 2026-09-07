import { DateValue } from './types.mjs';
import '@internationalized/date';

declare function parseDateString(date: string, locale: string, timeZone: string): DateValue | undefined;

export { parseDateString };
