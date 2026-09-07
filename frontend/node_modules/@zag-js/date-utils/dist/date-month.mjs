// src/date-month.ts
import {
  DateFormatter,
  endOfWeek,
  getWeeksInMonth,
  isSameDay,
  startOfWeek
} from "@internationalized/date";
var daysOfTheWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
function normalizeFirstDayOfWeek(firstDayOfWeek) {
  return firstDayOfWeek != null ? daysOfTheWeek[firstDayOfWeek] : void 0;
}
function getStartOfWeek(date, locale, firstDayOfWeek) {
  const firstDay = normalizeFirstDayOfWeek(firstDayOfWeek);
  return startOfWeek(date, locale, firstDay);
}
function getEndOfWeek(date, locale, firstDayOfWeek = 0) {
  const firstDay = normalizeFirstDayOfWeek(firstDayOfWeek);
  return endOfWeek(date, locale, firstDay);
}
function getDaysInWeek(weekIndex, from, locale, firstDayOfWeek) {
  const weekDate = from.add({ weeks: weekIndex });
  const dates = [];
  let date = getStartOfWeek(weekDate, locale, firstDayOfWeek);
  while (dates.length < 7) {
    dates.push(date);
    let nextDate = date.add({ days: 1 });
    if (isSameDay(date, nextDate)) break;
    date = nextDate;
  }
  return dates;
}
function getMonthDays(from, locale, numOfWeeks, firstDayOfWeek) {
  const firstDay = normalizeFirstDayOfWeek(firstDayOfWeek);
  const monthWeeks = numOfWeeks ?? getWeeksInMonth(from, locale, firstDay);
  const weeks = [...new Array(monthWeeks).keys()];
  return weeks.map((week) => getDaysInWeek(week, from, locale, firstDayOfWeek));
}
function getWeekdayFormats(locale, timeZone) {
  const longFormat = new DateFormatter(locale, { weekday: "long", timeZone });
  const shortFormat = new DateFormatter(locale, { weekday: "short", timeZone });
  const narrowFormat = new DateFormatter(locale, { weekday: "narrow", timeZone });
  return (value) => {
    const date = value instanceof Date ? value : value.toDate(timeZone);
    return {
      value,
      short: shortFormat.format(date),
      long: longFormat.format(date),
      narrow: narrowFormat.format(date)
    };
  };
}
function getWeekDays(date, startOfWeekProp, timeZone, locale) {
  const firstDayOfWeek = getStartOfWeek(date, locale, startOfWeekProp);
  const weeks = [...new Array(7).keys()];
  const format = getWeekdayFormats(locale, timeZone);
  return weeks.map((index) => format(firstDayOfWeek.add({ days: index })));
}
function getMonthNames(locale, format = "long", referenceDate) {
  if (!referenceDate || referenceDate.calendar.identifier === "gregory" || referenceDate.calendar.identifier === "iso8601") {
    const date = new Date(2021, 0, 1);
    const monthNames2 = [];
    for (let i = 0; i < 12; i++) {
      monthNames2.push(date.toLocaleString(locale, { month: format }));
      date.setMonth(date.getMonth() + 1);
    }
    return monthNames2;
  }
  const monthCount = referenceDate.calendar.getMonthsInYear(referenceDate);
  const formatter = new DateFormatter(locale, {
    month: format,
    calendar: referenceDate.calendar.identifier
  });
  const monthNames = [];
  for (let month = 1; month <= monthCount; month++) {
    const d = referenceDate.set({ month });
    monthNames.push(formatter.format(d.toDate("UTC")));
  }
  return monthNames;
}
function getWeekOfYear(date, locale) {
  const mondayOfWeek = startOfWeek(date, locale, "mon");
  const year = mondayOfWeek.year;
  const jan4 = mondayOfWeek.set({ month: 1, day: 4 });
  const week1Monday = startOfWeek(jan4, locale, "mon");
  const julianMonday = mondayOfWeek.calendar.toJulianDay(mondayOfWeek);
  const julianWeek1 = week1Monday.calendar.toJulianDay(week1Monday);
  if (julianMonday >= julianWeek1) {
    return 1 + Math.floor((julianMonday - julianWeek1) / 7);
  }
  const prevJan4 = mondayOfWeek.set({ year: year - 1, month: 1, day: 4 });
  const prevWeek1Monday = startOfWeek(prevJan4, locale, "mon");
  const julianPrevWeek1 = prevWeek1Monday.calendar.toJulianDay(prevWeek1Monday);
  return 1 + Math.floor((julianMonday - julianPrevWeek1) / 7);
}
export {
  getDaysInWeek,
  getEndOfWeek,
  getMonthDays,
  getMonthNames,
  getStartOfWeek,
  getWeekDays,
  getWeekOfYear,
  getWeekdayFormats
};
