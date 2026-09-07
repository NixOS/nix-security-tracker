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

// src/format-relative-time.ts
var format_relative_time_exports = {};
__export(format_relative_time_exports, {
  formatRelativeTime: () => formatRelativeTime
});
module.exports = __toCommonJS(format_relative_time_exports);
var import_cache = require("./cache.js");
var getRelativeTimeFormatter = (0, import_cache.i18nCache)(Intl.RelativeTimeFormat);
function formatRelativeTime(value, locale, options = {}) {
  const rtf = getRelativeTimeFormatter(locale, options);
  const now = /* @__PURE__ */ new Date();
  const diff = getDistance(now, value);
  if (diff.years > 0) return rtf.format(diff.years * diff.sign, "year");
  if (diff.months > 0) return rtf.format(diff.months * diff.sign, "month");
  if (diff.weeks > 0) return rtf.format(diff.weeks * diff.sign, "week");
  if (diff.days > 0) return rtf.format(diff.days * diff.sign, "day");
  if (diff.hours > 0) return rtf.format(diff.hours * diff.sign, "hour");
  if (diff.minutes > 0) return rtf.format(diff.minutes * diff.sign, "minute");
  return rtf.format(diff.seconds * diff.sign, "second");
}
var SECOND_TO_MS = 1e3;
var MINUTE_TO_MS = 1e3 * 60;
var HOUR_TO_MS = 1e3 * 60 * 60;
var DAY_TO_MS = 1e3 * 60 * 60 * 24;
var WEEK_TO_MS = 1e3 * 60 * 60 * 24 * 7;
var MONTH_TO_MS = 1e3 * 60 * 60 * 24 * 30;
var YEAR_TO_MS = 1e3 * 60 * 60 * 24 * 365;
function getDistance(startDate, endDate) {
  const endTime = endDate.getTime();
  const startTime = startDate.getTime();
  const distance = Math.abs(endTime - startTime);
  return {
    sign: Math.sign(endTime - startTime),
    days: Math.floor(distance / DAY_TO_MS),
    hours: Math.floor(distance % DAY_TO_MS / HOUR_TO_MS),
    minutes: Math.floor(distance % HOUR_TO_MS / MINUTE_TO_MS),
    seconds: Math.floor(distance % MINUTE_TO_MS / SECOND_TO_MS),
    weeks: Math.floor(distance / WEEK_TO_MS),
    months: Math.floor(distance / MONTH_TO_MS),
    years: Math.floor(distance / YEAR_TO_MS)
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  formatRelativeTime
});
