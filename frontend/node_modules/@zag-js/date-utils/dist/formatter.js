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

// src/formatter.ts
var formatter_exports = {};
__export(formatter_exports, {
  getDayFormatter: () => getDayFormatter,
  getMonthFormatter: () => getMonthFormatter
});
module.exports = __toCommonJS(formatter_exports);
var import_date = require("@internationalized/date");
var import_get_era_format = require("./get-era-format.js");
function getDayFormatter(locale, timeZone, referenceDate) {
  const date = referenceDate ?? (0, import_date.toCalendarDateTime)((0, import_date.today)(timeZone));
  return new import_date.DateFormatter(locale, {
    weekday: "long",
    month: "long",
    year: "numeric",
    day: "numeric",
    era: (0, import_get_era_format.getEraFormat)(date),
    calendar: date.calendar.identifier,
    timeZone
  });
}
function getMonthFormatter(locale, timeZone, referenceDate) {
  const date = referenceDate ?? (0, import_date.today)(timeZone);
  return new import_date.DateFormatter(locale, {
    month: "long",
    year: "numeric",
    era: (0, import_get_era_format.getEraFormat)(date),
    calendar: date.calendar.identifier,
    timeZone
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getDayFormatter,
  getMonthFormatter
});
