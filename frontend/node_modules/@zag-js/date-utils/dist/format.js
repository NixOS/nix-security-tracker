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

// src/format.ts
var format_exports = {};
__export(format_exports, {
  formatRange: () => formatRange,
  formatSelectedDate: () => formatSelectedDate,
  formatVisibleRange: () => formatVisibleRange
});
module.exports = __toCommonJS(format_exports);
var import_date = require("@internationalized/date");
var import_formatter = require("./formatter.js");
function formatRange(startDate, endDate, formatter, toString, timeZone) {
  let parts = formatter.formatRangeToParts(startDate.toDate(timeZone), endDate.toDate(timeZone));
  let separatorIndex = -1;
  for (let i = 0; i < parts.length; i++) {
    let part = parts[i];
    if (part.source === "shared" && part.type === "literal") {
      separatorIndex = i;
    } else if (part.source === "endRange") {
      break;
    }
  }
  let start = "";
  let end = "";
  for (let i = 0; i < parts.length; i++) {
    if (i < separatorIndex) {
      start += parts[i].value;
    } else if (i > separatorIndex) {
      end += parts[i].value;
    }
  }
  return toString(start, end);
}
function formatSelectedDate(startDate, endDate, locale, timeZone) {
  if (!startDate) return "";
  let start = startDate;
  let end = endDate ?? startDate;
  let formatter = (0, import_formatter.getDayFormatter)(locale, timeZone);
  if ((0, import_date.isSameDay)(start, end)) {
    return formatter.format(start.toDate(timeZone));
  }
  return formatRange(start, end, formatter, (start2, end2) => `${start2} \u2013 ${end2}`, timeZone);
}
function formatVisibleRange(startDate, endDate, locale, timeZone) {
  const start = startDate;
  const end = endDate ?? startDate;
  const dayFormatter = (0, import_formatter.getDayFormatter)(locale, timeZone);
  if (!(0, import_date.isSameDay)(start, (0, import_date.startOfMonth)(start))) {
    return dayFormatter.formatRange(start.toDate(timeZone), end.toDate(timeZone));
  }
  const monthFormatter = (0, import_formatter.getMonthFormatter)(locale, timeZone);
  if ((0, import_date.isSameDay)(end, (0, import_date.endOfMonth)(start))) {
    return monthFormatter.format(start.toDate(timeZone));
  }
  if ((0, import_date.isSameDay)(end, (0, import_date.endOfMonth)(end))) {
    return monthFormatter.formatRange(start.toDate(timeZone), end.toDate(timeZone));
  }
  return "";
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  formatRange,
  formatSelectedDate,
  formatVisibleRange
});
