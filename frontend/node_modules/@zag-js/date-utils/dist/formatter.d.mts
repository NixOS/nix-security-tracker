import { DateValue, DateFormatter } from '@internationalized/date';

declare function getDayFormatter(locale: string, timeZone: string, referenceDate?: DateValue): DateFormatter;
declare function getMonthFormatter(locale: string, timeZone: string, referenceDate?: DateValue): DateFormatter;

export { getDayFormatter, getMonthFormatter };
