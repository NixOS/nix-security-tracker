// src/format.ts
import { endOfMonth, isSameDay, startOfMonth } from "@internationalized/date";
import { getDayFormatter, getMonthFormatter } from "./formatter.mjs";
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
  let formatter = getDayFormatter(locale, timeZone);
  if (isSameDay(start, end)) {
    return formatter.format(start.toDate(timeZone));
  }
  return formatRange(start, end, formatter, (start2, end2) => `${start2} \u2013 ${end2}`, timeZone);
}
function formatVisibleRange(startDate, endDate, locale, timeZone) {
  const start = startDate;
  const end = endDate ?? startDate;
  const dayFormatter = getDayFormatter(locale, timeZone);
  if (!isSameDay(start, startOfMonth(start))) {
    return dayFormatter.formatRange(start.toDate(timeZone), end.toDate(timeZone));
  }
  const monthFormatter = getMonthFormatter(locale, timeZone);
  if (isSameDay(end, endOfMonth(start))) {
    return monthFormatter.format(start.toDate(timeZone));
  }
  if (isSameDay(end, endOfMonth(end))) {
    return monthFormatter.formatRange(start.toDate(timeZone), end.toDate(timeZone));
  }
  return "";
}
export {
  formatRange,
  formatSelectedDate,
  formatVisibleRange
};
