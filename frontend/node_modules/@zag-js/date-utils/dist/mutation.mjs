// src/mutation.ts
import {
  getLocalTimeZone,
  toCalendar,
  toCalendarDateTime,
  today
} from "@internationalized/date";
import { constrainValue } from "./constrain.mjs";
function getTodayDate(timeZone, calendar) {
  const tod = today(timeZone ?? getLocalTimeZone());
  if (calendar) return toCalendar(tod, calendar);
  return tod;
}
function setCalendar(date, calendar) {
  return toCalendar(toCalendarDateTime(date), calendar);
}
function setDate(date, startDate, isDateUnavailable, locale, minValue, maxValue) {
  let result;
  result = constrainValue(date, minValue, maxValue);
  result = getPreviousAvailableDate(date, startDate, locale, isDateUnavailable);
  return result;
}
function getPreviousAvailableDate(date, minValue, locale, isDateUnavailable) {
  if (!isDateUnavailable) {
    return date;
  }
  while (date.compare(minValue) >= 0 && isDateUnavailable(date, locale)) {
    date = date.subtract({ days: 1 });
  }
  if (date.compare(minValue) >= 0) {
    return date;
  }
}
export {
  getPreviousAvailableDate,
  getTodayDate,
  setCalendar,
  setDate
};
