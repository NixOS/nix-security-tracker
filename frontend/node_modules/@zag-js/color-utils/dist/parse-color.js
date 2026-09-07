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

// src/parse-color.ts
var parse_color_exports = {};
__export(parse_color_exports, {
  normalizeColor: () => normalizeColor,
  parseColor: () => parseColor
});
module.exports = __toCommonJS(parse_color_exports);
var import_hsb_color = require("./hsb-color.js");
var import_hsl_color = require("./hsl-color.js");
var import_native_color = require("./native-color.js");
var import_rgb_color = require("./rgb-color.js");
var parseColor = (value) => {
  if (import_native_color.nativeColorMap.has(value)) {
    return parseColor(import_native_color.nativeColorMap.get(value));
  }
  const result = import_rgb_color.RGBColor.parse(value) || import_hsb_color.HSBColor.parse(value) || import_hsl_color.HSLColor.parse(value);
  if (!result) {
    const error = new Error("Invalid color value: " + value);
    Error.captureStackTrace?.(error, parseColor);
    throw error;
  }
  return result;
};
var normalizeColor = (v) => {
  return typeof v === "string" ? parseColor(v) : v;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  normalizeColor,
  parseColor
});
