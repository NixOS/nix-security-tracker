// src/timer.parse.ts
import { isObject } from "@zag-js/utils";
var segments = /* @__PURE__ */ new Set(["days", "hours", "minutes", "seconds"]);
function isTimeSegment(date) {
  return isObject(date) && Object.keys(date).some((key) => segments.has(key));
}
function parse(date) {
  if (typeof date === "string") {
    return new Date(date).getTime();
  }
  if (isTimeSegment(date)) {
    const { days = 0, hours = 0, minutes = 0, seconds = 0, milliseconds = 0 } = date;
    const value = (days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds) * 1e3;
    return value + milliseconds;
  }
  throw new Error("Invalid date");
}
export {
  parse
};
