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

// src/align.ts
var align_exports = {};
__export(align_exports, {
  alignDate: () => alignDate,
  alignStartDate: () => alignStartDate
});
module.exports = __toCommonJS(align_exports);
var import_constrain = require("./constrain.js");
function alignDate(date, alignment, duration, locale, min, max) {
  switch (alignment) {
    case "start":
      return (0, import_constrain.alignStart)(date, duration, locale, min, max);
    case "end":
      return (0, import_constrain.alignEnd)(date, duration, locale, min, max);
    case "center":
    default:
      return (0, import_constrain.alignCenter)(date, duration, locale, min, max);
  }
}
function alignStartDate(date, startDate, endDate, duration, locale, min, max) {
  if (date.compare(startDate) < 0) {
    return (0, import_constrain.alignEnd)(date, duration, locale, min, max);
  }
  if (date.compare(endDate) > 0) {
    return (0, import_constrain.alignStart)(date, duration, locale, min, max);
  }
  return startDate;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  alignDate,
  alignStartDate
});
