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

// src/parse-date.ts
var parse_date_exports = {};
__export(parse_date_exports, {
  parseDateString: () => parseDateString
});
module.exports = __toCommonJS(parse_date_exports);
var import_date = require("@internationalized/date");
var import_date_year = require("./date-year.js");
var isValidYear = (year) => year != null && year.length === 4;
var isValidMonth = (month) => month != null && parseFloat(month) <= 12;
var isValidDay = (day) => day != null && parseFloat(day) <= 31;
function parseDateString(date, locale, timeZone) {
  const regex = createRegex(locale, timeZone);
  let { year, month, day } = extract(regex, date) ?? {};
  const hasMatch = year != null || month != null || day != null;
  if (hasMatch) {
    const curr = /* @__PURE__ */ new Date();
    year || (year = curr.getFullYear().toString());
    month || (month = (curr.getMonth() + 1).toString());
    day || (day = curr.getDate().toString());
  }
  if (!isValidYear(year)) {
    year = (0, import_date_year.normalizeYear)(year);
  }
  if (isValidYear(year) && isValidMonth(month) && isValidDay(day)) {
    return new import_date.CalendarDate(+year, +month, +day);
  }
  const time = Date.parse(date);
  if (!isNaN(time)) {
    const date2 = new Date(time);
    return new import_date.CalendarDate(date2.getFullYear(), date2.getMonth() + 1, date2.getDate());
  }
}
function createRegex(locale, timeZone) {
  const formatter = new import_date.DateFormatter(locale, { day: "numeric", month: "numeric", year: "numeric", timeZone });
  const parts = formatter.formatToParts(new Date(2e3, 11, 25));
  return parts.map(({ type, value }) => type === "literal" ? `${value}?` : `((?!=<${type}>)\\d+)?`).join("");
}
function extract(pattern, str) {
  const matches = str.match(pattern);
  return pattern.toString().match(/<(.+?)>/g)?.map((group) => {
    const groupMatches = group.match(/<(.+)>/);
    if (!groupMatches || groupMatches.length <= 0) {
      return null;
    }
    return group.match(/<(.+)>/)?.[1];
  }).reduce((acc, curr, index) => {
    if (!curr) return acc;
    if (matches && matches.length > index) {
      acc[curr] = matches[index + 1];
    } else {
      acc[curr] = null;
    }
    return acc;
  }, {});
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  parseDateString
});
