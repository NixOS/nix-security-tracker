// src/number-input.utils.ts
import { NumberParser } from "@internationalized/number";
var createFormatter = (locale, options = {}) => {
  return new Intl.NumberFormat(locale, options);
};
var createParser = (locale, options = {}) => {
  return new NumberParser(locale, options);
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
export {
  createFormatter,
  createParser,
  formatValue,
  getDefaultStep,
  parseValue
};
