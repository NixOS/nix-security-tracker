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

// src/preset.ts
var preset_exports = {};
__export(preset_exports, {
  getDateRangePreset: () => getDateRangePreset
});
module.exports = __toCommonJS(preset_exports);
var import_date = require("@internationalized/date");
function getDateRangePreset(preset, locale, timeZone) {
  const today = (0, import_date.toCalendarDate)((0, import_date.now)(timeZone));
  switch (preset) {
    case "thisWeek":
      return [(0, import_date.startOfWeek)(today, locale), (0, import_date.endOfWeek)(today, locale)];
    case "thisMonth":
      return [(0, import_date.startOfMonth)(today), today];
    case "thisQuarter":
      return [(0, import_date.startOfMonth)(today).add({ months: -((today.month - 1) % 3) }), today];
    case "thisYear":
      return [(0, import_date.startOfYear)(today), today];
    case "last3Days":
      return [today.add({ days: -2 }), today];
    case "last7Days":
      return [today.add({ days: -6 }), today];
    case "last14Days":
      return [today.add({ days: -13 }), today];
    case "last30Days":
      return [today.add({ days: -29 }), today];
    case "last90Days":
      return [today.add({ days: -89 }), today];
    case "lastMonth":
      return [(0, import_date.startOfMonth)(today.add({ months: -1 })), (0, import_date.endOfMonth)(today.add({ months: -1 }))];
    case "lastQuarter":
      return [
        (0, import_date.startOfMonth)(today.add({ months: -((today.month - 1) % 3) - 3 })),
        (0, import_date.endOfMonth)(today.add({ months: -((today.month - 1) % 3) - 1 }))
      ];
    case "lastWeek":
      return [(0, import_date.startOfWeek)(today, locale).add({ weeks: -1 }), (0, import_date.endOfWeek)(today, locale).add({ weeks: -1 })];
    case "lastYear":
      return [(0, import_date.startOfYear)(today.add({ years: -1 })), (0, import_date.endOfYear)(today.add({ years: -1 }))];
    default:
      throw new Error(`Invalid date range preset: ${preset}`);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getDateRangePreset
});
