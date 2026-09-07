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

// src/pin-input.utils.ts
var pin_input_utils_exports = {};
__export(pin_input_utils_exports, {
  isValidType: () => isValidType,
  isValidValue: () => isValidValue
});
module.exports = __toCommonJS(pin_input_utils_exports);
var REGEX = {
  numeric: /^[0-9]+$/,
  alphabetic: /^[A-Za-z]+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/i
};
function isValidType(type, value) {
  if (!type) return true;
  return !!REGEX[type]?.test(value);
}
function isValidValue(value, type, pattern) {
  if (!pattern) return isValidType(type, value);
  const regex = new RegExp(pattern, "g");
  return regex.test(value);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isValidType,
  isValidValue
});
