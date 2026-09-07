import "./chunk-QZ7TP4HQ.mjs";

// src/parse-color.ts
import { HSBColor } from "./hsb-color.mjs";
import { HSLColor } from "./hsl-color.mjs";
import { nativeColorMap } from "./native-color.mjs";
import { RGBColor } from "./rgb-color.mjs";
var parseColor = (value) => {
  if (nativeColorMap.has(value)) {
    return parseColor(nativeColorMap.get(value));
  }
  const result = RGBColor.parse(value) || HSBColor.parse(value) || HSLColor.parse(value);
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
export {
  normalizeColor,
  parseColor
};
