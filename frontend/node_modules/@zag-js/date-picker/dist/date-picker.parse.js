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

// src/date-picker.parse.ts
var date_picker_parse_exports = {};
__export(date_picker_parse_exports, {
  parse: () => parse
});
module.exports = __toCommonJS(date_picker_parse_exports);
var import_date = require("@internationalized/date");
function parse(value) {
  if (Array.isArray(value)) {
    return value.map((v) => parse(v));
  }
  if (value instanceof Date) {
    return new import_date.CalendarDate(value.getFullYear(), value.getMonth() + 1, value.getDate());
  }
  return (0, import_date.parseDate)(value);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  parse
});
