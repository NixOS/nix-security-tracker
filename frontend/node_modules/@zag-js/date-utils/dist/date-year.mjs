// src/date-year.ts
import { CalendarDate, toCalendar } from "@internationalized/date";
function getYearsRange(range) {
  const years = [];
  for (let year = range.from; year <= range.to; year += 1) years.push(year);
  return years;
}
var DEFAULT_MIN_YEAR = 1900;
var DEFAULT_MAX_YEAR = 2099;
function getDefaultYearRange(referenceDate, min, max) {
  const calendar = referenceDate.calendar;
  const fromYear = min?.year ?? toCalendar(new CalendarDate(DEFAULT_MIN_YEAR, 1, 1), calendar).year;
  const toYear = max?.year ?? toCalendar(new CalendarDate(DEFAULT_MAX_YEAR, 12, 31), calendar).year;
  return { from: fromYear, to: toYear };
}
var FUTURE_YEAR_COERCION = 10;
function normalizeYear(year) {
  if (!year) return;
  if (year.length === 3) return year.padEnd(4, "0");
  if (year.length === 2) {
    const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
    const currentCentury = Math.floor(currentYear / 100) * 100;
    const twoDigitYear = parseInt(year.slice(-2), 10);
    const fullYear = currentCentury + twoDigitYear;
    return fullYear > currentYear + FUTURE_YEAR_COERCION ? (fullYear - 100).toString() : fullYear.toString();
  }
  return year;
}
function getDecadeRange(year, opts) {
  const chunkSize = opts?.strict ? 10 : 12;
  const computedYear = year - year % 10;
  const years = [];
  for (let i = 0; i < chunkSize; i += 1) {
    const value = computedYear + i;
    years.push(value);
  }
  return years;
}
export {
  getDecadeRange,
  getDefaultYearRange,
  getYearsRange,
  normalizeYear
};
