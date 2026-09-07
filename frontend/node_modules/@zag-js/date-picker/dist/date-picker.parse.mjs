// src/date-picker.parse.ts
import { CalendarDate, parseDate } from "@internationalized/date";
function parse(value) {
  if (Array.isArray(value)) {
    return value.map((v) => parse(v));
  }
  if (value instanceof Date) {
    return new CalendarDate(value.getFullYear(), value.getMonth() + 1, value.getDate());
  }
  return parseDate(value);
}
export {
  parse
};
