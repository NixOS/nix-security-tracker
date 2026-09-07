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

// src/mutation.ts
var mutation_exports = {};
__export(mutation_exports, {
  getPreviousAvailableDate: () => getPreviousAvailableDate,
  getTodayDate: () => getTodayDate,
  setCalendar: () => setCalendar,
  setDate: () => setDate
});
module.exports = __toCommonJS(mutation_exports);
var import_date = require("@internationalized/date");
var import_constrain = require("./constrain.js");
function getTodayDate(timeZone, calendar) {
  const tod = (0, import_date.today)(timeZone ?? (0, import_date.getLocalTimeZone)());
  if (calendar) return (0, import_date.toCalendar)(tod, calendar);
  return tod;
}
function setCalendar(date, calendar) {
  return (0, import_date.toCalendar)((0, import_date.toCalendarDateTime)(date), calendar);
}
function setDate(date, startDate, isDateUnavailable, locale, minValue, maxValue) {
  let result;
  result = (0, import_constrain.constrainValue)(date, minValue, maxValue);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getPreviousAvailableDate,
  getTodayDate,
  setCalendar,
  setDate
});
