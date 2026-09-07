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

// src/date-year.ts
var date_year_exports = {};
__export(date_year_exports, {
  getDecadeRange: () => getDecadeRange,
  getDefaultYearRange: () => getDefaultYearRange,
  getYearsRange: () => getYearsRange,
  normalizeYear: () => normalizeYear
});
module.exports = __toCommonJS(date_year_exports);
var import_date = require("@internationalized/date");
function getYearsRange(range) {
  const years = [];
  for (let year = range.from; year <= range.to; year += 1) years.push(year);
  return years;
}
var DEFAULT_MIN_YEAR = 1900;
var DEFAULT_MAX_YEAR = 2099;
function getDefaultYearRange(referenceDate, min, max) {
  const calendar = referenceDate.calendar;
  const fromYear = min?.year ?? (0, import_date.toCalendar)(new import_date.CalendarDate(DEFAULT_MIN_YEAR, 1, 1), calendar).year;
  const toYear = max?.year ?? (0, import_date.toCalendar)(new import_date.CalendarDate(DEFAULT_MAX_YEAR, 12, 31), calendar).year;
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getDecadeRange,
  getDefaultYearRange,
  getYearsRange,
  normalizeYear
});
