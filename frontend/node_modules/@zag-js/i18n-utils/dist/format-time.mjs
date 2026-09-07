// src/format-time.ts
import { i18nCache } from "./cache.mjs";
var getTimeFormatter = i18nCache(Intl.DateTimeFormat);
function splitTimeString(timeString) {
  const [hours = null, minutes = null, seconds = null] = timeString.split(":");
  const parsedHours = hours === null ? null : Number(hours);
  const parsedMinutes = minutes === null ? null : Number(minutes);
  const parsedSeconds = seconds === null ? null : Number(seconds);
  return {
    hours: Number.isNaN(parsedHours) ? null : parsedHours,
    minutes: Number.isNaN(parsedMinutes) ? null : parsedMinutes,
    seconds: Number.isNaN(parsedSeconds) ? null : parsedSeconds
  };
}
function getTimeParts(value) {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return {
      date: value,
      hours: value.getHours(),
      minutes: value.getMinutes(),
      seconds: value.getSeconds()
    };
  }
  const { hours, minutes, seconds } = splitTimeString(value);
  if (hours === null || minutes === null) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  if (seconds !== null && (seconds < 0 || seconds > 59)) return null;
  const date = /* @__PURE__ */ new Date(0);
  date.setHours(hours, minutes, seconds ?? 0, 0);
  return { date, hours, minutes, seconds: seconds ?? 0 };
}
function formatTime(value, locale, options = {}) {
  const { format = "24h", amLabel, pmLabel, withSeconds = false } = options;
  const parts = getTimeParts(value);
  if (!parts) return null;
  const formatter = getTimeFormatter(locale, {
    hour: format === "24h" ? "2-digit" : "numeric",
    minute: "2-digit",
    second: withSeconds ? "2-digit" : void 0,
    hour12: format === "12h"
  });
  if (format !== "12h") {
    return formatter.format(parts.date);
  }
  const isPm = parts.hours >= 12;
  const tokens = formatter.formatToParts(parts.date);
  return tokens.map((token) => {
    if (token.type !== "dayPeriod") return token.value;
    if (isPm) return pmLabel ?? token.value;
    return amLabel ?? token.value;
  }).join("");
}
export {
  formatTime
};
