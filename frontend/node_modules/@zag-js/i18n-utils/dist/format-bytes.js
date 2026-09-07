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

// src/format-bytes.ts
var format_bytes_exports = {};
__export(format_bytes_exports, {
  formatBytes: () => formatBytes
});
module.exports = __toCommonJS(format_bytes_exports);
var import_format_number = require("./format-number.js");
var bitPrefixes = ["", "kilo", "mega", "giga", "tera"];
var bytePrefixes = ["", "kilo", "mega", "giga", "tera", "peta"];
var formatBytes = (bytes, locale = "en-US", options = {}) => {
  if (Number.isNaN(bytes)) return "";
  if (bytes === 0) return "0 B";
  const { unitSystem = "decimal", precision = 3, unit = "byte", unitDisplay = "short" } = options;
  const factor = unitSystem === "binary" ? 1024 : 1e3;
  const prefix = unit === "bit" ? bitPrefixes : bytePrefixes;
  const isNegative = bytes < 0;
  const absoluteBytes = Math.abs(bytes);
  let value = absoluteBytes;
  let index = 0;
  while (value >= factor && index < prefix.length - 1) {
    value /= factor;
    index++;
  }
  const v = parseFloat(value.toPrecision(precision));
  const finalValue = isNegative ? -v : v;
  return (0, import_format_number.formatNumber)(finalValue, locale, {
    style: "unit",
    unit: prefix[index] + unit,
    unitDisplay
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  formatBytes
});
