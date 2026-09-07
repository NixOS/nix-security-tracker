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

// src/timer.parse.ts
var timer_parse_exports = {};
__export(timer_parse_exports, {
  parse: () => parse
});
module.exports = __toCommonJS(timer_parse_exports);
var import_utils = require("@zag-js/utils");
var segments = /* @__PURE__ */ new Set(["days", "hours", "minutes", "seconds"]);
function isTimeSegment(date) {
  return (0, import_utils.isObject)(date) && Object.keys(date).some((key) => segments.has(key));
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  parse
});
