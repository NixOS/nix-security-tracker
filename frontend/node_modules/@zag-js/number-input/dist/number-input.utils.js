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

// src/number-input.utils.ts
var number_input_utils_exports = {};
__export(number_input_utils_exports, {
  createFormatter: () => createFormatter,
  createParser: () => createParser,
  formatValue: () => formatValue,
  getDefaultStep: () => getDefaultStep,
  parseValue: () => parseValue
});
module.exports = __toCommonJS(number_input_utils_exports);
var import_number = require("@internationalized/number");
var createFormatter = (locale, options = {}) => {
  return new Intl.NumberFormat(locale, options);
};
var createParser = (locale, options = {}) => {
  return new import_number.NumberParser(locale, options);
};
var parseValue = (value, params) => {
  const { prop, computed } = params;
  if (!prop("formatOptions")) return parseFloat(value);
  if (value === "") return Number.NaN;
  return computed("parser").parse(value);
};
var formatValue = (value, params) => {
  const { prop, computed } = params;
  if (Number.isNaN(value)) return "";
  if (!prop("formatOptions")) return value.toString();
  return computed("formatter").format(value);
};
var getDefaultStep = (step, formatOptions) => {
  let defaultStep = step !== void 0 && !Number.isNaN(step) ? step : 1;
  if (formatOptions?.style === "percent" && (step === void 0 || Number.isNaN(step))) {
    defaultStep = 0.01;
  }
  return defaultStep;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createFormatter,
  createParser,
  formatValue,
  getDefaultStep,
  parseValue
});
