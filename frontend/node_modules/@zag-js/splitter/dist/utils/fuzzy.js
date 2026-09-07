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

// src/utils/fuzzy.ts
var fuzzy_exports = {};
__export(fuzzy_exports, {
  PRECISION: () => PRECISION,
  fuzzyCompareNumbers: () => fuzzyCompareNumbers,
  fuzzyNumbersEqual: () => fuzzyNumbersEqual,
  fuzzySizeEqual: () => fuzzySizeEqual
});
module.exports = __toCommonJS(fuzzy_exports);
var PRECISION = 10;
function fuzzyCompareNumbers(actual, expected, fractionDigits = PRECISION) {
  if (actual.toFixed(fractionDigits) === expected.toFixed(fractionDigits)) {
    return 0;
  } else {
    return actual > expected ? 1 : -1;
  }
}
function fuzzyNumbersEqual(actual, expected, fractionDigits = PRECISION) {
  if (actual == null || expected == null) return false;
  return fuzzyCompareNumbers(actual, expected, fractionDigits) === 0;
}
function fuzzySizeEqual(actual, expected, fractionDigits) {
  if (actual.length !== expected.length) {
    return false;
  }
  for (let index = 0; index < actual.length; index++) {
    const actualSize = actual[index];
    const expectedSize = expected[index];
    if (!fuzzyNumbersEqual(actualSize, expectedSize, fractionDigits)) {
      return false;
    }
  }
  return true;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PRECISION,
  fuzzyCompareNumbers,
  fuzzyNumbersEqual,
  fuzzySizeEqual
});
