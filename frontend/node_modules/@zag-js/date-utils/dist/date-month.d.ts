import * as _internationalized_date from '@internationalized/date';
import { DateValue } from '@internationalized/date';

declare function getStartOfWeek(date: DateValue, locale: string, firstDayOfWeek?: number): DateValue;
declare function getEndOfWeek(date: DateValue, locale: string, firstDayOfWeek?: number): DateValue;
declare function getDaysInWeek(weekIndex: number, from: DateValue, locale: string, firstDayOfWeek?: number): DateValue[];
declare function getMonthDays(from: DateValue, locale: string, numOfWeeks?: number, firstDayOfWeek?: number): DateValue[][];
declare function getWeekdayFormats(locale: string, timeZone: string): <T extends DateValue | Date>(value: T) => {
    value: T;
    short: string;
    long: string;
    narrow: string;
};
declare function getWeekDays(date: DateValue, startOfWeekProp: number | undefined, timeZone: string, locale: string): {
    value: _internationalized_date.CalendarDate | _internationalized_date.CalendarDateTime | _internationalized_date.ZonedDateTime;
    short: string;
    long: string;
    narrow: string;
}[];
declare function getMonthNames(locale: string, format?: Intl.DateTimeFormatOptions["month"], referenceDate?: DateValue): string[];
declare function getWeekOfYear(date: DateValue, locale: string): number;

export { getDaysInWeek, getEndOfWeek, getMonthDays, getMonthNames, getStartOfWeek, getWeekDays, getWeekOfYear, getWeekdayFormats };
