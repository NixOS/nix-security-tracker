// src/parse-date.ts
import { CalendarDate, DateFormatter } from "@internationalized/date";
import { normalizeYear } from "./date-year.mjs";
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
    year = normalizeYear(year);
  }
  if (isValidYear(year) && isValidMonth(month) && isValidDay(day)) {
    return new CalendarDate(+year, +month, +day);
  }
  const time = Date.parse(date);
  if (!isNaN(time)) {
    const date2 = new Date(time);
    return new CalendarDate(date2.getFullYear(), date2.getMonth() + 1, date2.getDate());
  }
}
function createRegex(locale, timeZone) {
  const formatter = new DateFormatter(locale, { day: "numeric", month: "numeric", year: "numeric", timeZone });
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
export {
  parseDateString
};
