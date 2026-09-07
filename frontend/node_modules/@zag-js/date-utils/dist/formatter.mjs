// src/formatter.ts
import { DateFormatter, toCalendarDateTime, today } from "@internationalized/date";
import { getEraFormat } from "./get-era-format.mjs";
function getDayFormatter(locale, timeZone, referenceDate) {
  const date = referenceDate ?? toCalendarDateTime(today(timeZone));
  return new DateFormatter(locale, {
    weekday: "long",
    month: "long",
    year: "numeric",
    day: "numeric",
    era: getEraFormat(date),
    calendar: date.calendar.identifier,
    timeZone
  });
}
function getMonthFormatter(locale, timeZone, referenceDate) {
  const date = referenceDate ?? today(timeZone);
  return new DateFormatter(locale, {
    month: "long",
    year: "numeric",
    era: getEraFormat(date),
    calendar: date.calendar.identifier,
    timeZone
  });
}
export {
  getDayFormatter,
  getMonthFormatter
};
