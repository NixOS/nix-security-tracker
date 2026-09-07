// src/format-relative-time.ts
import { i18nCache } from "./cache.mjs";
var getRelativeTimeFormatter = i18nCache(Intl.RelativeTimeFormat);
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
export {
  formatRelativeTime
};
