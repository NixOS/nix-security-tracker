// src/align.ts
import { alignCenter, alignEnd, alignStart } from "./constrain.mjs";
function alignDate(date, alignment, duration, locale, min, max) {
  switch (alignment) {
    case "start":
      return alignStart(date, duration, locale, min, max);
    case "end":
      return alignEnd(date, duration, locale, min, max);
    case "center":
    default:
      return alignCenter(date, duration, locale, min, max);
  }
}
function alignStartDate(date, startDate, endDate, duration, locale, min, max) {
  if (date.compare(startDate) < 0) {
    return alignEnd(date, duration, locale, min, max);
  }
  if (date.compare(endDate) > 0) {
    return alignStart(date, duration, locale, min, max);
  }
  return startDate;
}
export {
  alignDate,
  alignStartDate
};
