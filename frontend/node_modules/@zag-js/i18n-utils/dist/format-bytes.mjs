// src/format-bytes.ts
import { formatNumber } from "./format-number.mjs";
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
  return formatNumber(finalValue, locale, {
    style: "unit",
    unit: prefix[index] + unit,
    unitDisplay
  });
};
export {
  formatBytes
};
