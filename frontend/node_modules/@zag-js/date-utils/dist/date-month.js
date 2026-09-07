"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/date-month.ts
var date_month_exports = {};
__export(date_month_exports, {
  getDaysInWeek: () => getDaysInWeek,
  getEndOfWeek: () => getEndOfWeek,
  getMonthDays: () => getMonthDays,
  getMonthNames: () => getMonthNames,
  getStartOfWeek: () => getStartOfWeek,
  getWeekDays: () => getWeekDays,
  getWeekOfYear: () => getWeekOfYear,
  getWeekdayFormats: () => getWeekdayFormats
});
module.exports = __toCommonJS(date_month_exports);
var import_date = require("@internationalized/date");
var daysOfTheWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
function normalizeFirstDayOfWeek(firstDayOfWeek) {
  return firstDayOfWeek != null ? daysOfTheWeek[firstDayOfWeek] : void 0;
}
function getStartOfWeek(date, locale, firstDayOfWeek) {
  const firstDay = normalizeFirstDayOfWeek(firstDayOfWeek);
  return (0, import_date.startOfWeek)(date, locale, firstDay);
}
function getEndOfWeek(date, locale, firstDayOfWeek = 0) {
  const firstDay = normalizeFirstDayOfWeek(firstDayOfWeek);
  return (0, import_date.endOfWeek)(date, locale, firstDay);
}
function getDaysInWeek(weekIndex, from, locale, firstDayOfWeek) {
  const weekDate = from.add({ weeks: weekIndex });
  const dates = [];
  let date = getStartOfWeek(weekDate, locale, firstDayOfWeek);
  while (dates.length < 7) {
    dates.push(date);
    let nextDate = date.add({ days: 1 });
    if ((0, import_date.isSameDay)(date, nextDate)) break;
    date = nextDate;
  }
  return dates;
}
function getMonthDays(from, locale, numOfWeeks, firstDayOfWeek) {
  const firstDay = normalizeFirstDayOfWeek(firstDayOfWeek);
  const monthWeeks = numOfWeeks ?? (0, import_date.getWeeksInMonth)(from, locale, firstDay);
  const weeks = [...new Array(monthWeeks).keys()];
  return weeks.map((week) => getDaysInWeek(week, from, locale, firstDayOfWeek));
}
function getWeekdayFormats(locale, timeZone) {
  const longFormat = new import_date.DateFormatter(locale, { weekday: "long", timeZone });
  const shortFormat = new import_date.DateFormatter(locale, { weekday: "short", timeZone });
  const narrowFormat = new import_date.DateFormatter(locale, { weekday: "narrow", timeZone });
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
  const formatter = new import_date.DateFormatter(locale, {
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
  const mondayOfWeek = (0, import_date.startOfWeek)(date, locale, "mon");
  const year = mondayOfWeek.year;
  const jan4 = mondayOfWeek.set({ month: 1, day: 4 });
  const week1Monday = (0, import_date.startOfWeek)(jan4, locale, "mon");
  const julianMonday = mondayOfWeek.calendar.toJulianDay(mondayOfWeek);
  const julianWeek1 = week1Monday.calendar.toJulianDay(week1Monday);
  if (julianMonday >= julianWeek1) {
    return 1 + Math.floor((julianMonday - julianWeek1) / 7);
  }
  const prevJan4 = mondayOfWeek.set({ year: year - 1, month: 1, day: 4 });
  const prevWeek1Monday = (0, import_date.startOfWeek)(prevJan4, locale, "mon");
  const julianPrevWeek1 = prevWeek1Monday.calendar.toJulianDay(prevWeek1Monday);
  return 1 + Math.floor((julianMonday - julianPrevWeek1) / 7);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getDaysInWeek,
  getEndOfWeek,
  getMonthDays,
  getMonthNames,
  getStartOfWeek,
  getWeekDays,
  getWeekOfYear,
  getWeekdayFormats
});
