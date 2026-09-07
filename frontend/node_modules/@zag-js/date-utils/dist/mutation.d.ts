import * as _internationalized_date from '@internationalized/date';
import { DateValue, Calendar } from '@internationalized/date';
import { DateAvailableFn } from './types.js';

declare function getTodayDate(timeZone?: string, calendar?: Calendar): _internationalized_date.CalendarDate;
declare function setCalendar(date: DateValue, calendar: Calendar): _internationalized_date.CalendarDateTime;
declare function setDate(date: DateValue, startDate: DateValue, isDateUnavailable: DateAvailableFn, locale: string, minValue: DateValue, maxValue: DateValue): DateValue | undefined;
declare function getPreviousAvailableDate(date: DateValue, minValue: DateValue, locale: string, isDateUnavailable?: DateAvailableFn): DateValue | undefined;

export { getPreviousAvailableDate, getTodayDate, setCalendar, setDate };
