import * as _internationalized_date from '@internationalized/date';
import { DateDuration } from '@internationalized/date';
import { DateValue, DateAlignment } from './types.mjs';

declare function alignDate(date: DateValue, alignment: DateAlignment, duration: DateDuration, locale: string, min?: DateValue | undefined, max?: DateValue | undefined): _internationalized_date.DateValue;
declare function alignStartDate(date: DateValue, startDate: DateValue, endDate: DateValue, duration: DateDuration, locale: string, min?: DateValue | undefined, max?: DateValue | undefined): _internationalized_date.CalendarDate | _internationalized_date.CalendarDateTime | _internationalized_date.ZonedDateTime;

export { alignDate, alignStartDate };
