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

// src/utils/is-valid-hex.ts
var is_valid_hex_exports = {};
__export(is_valid_hex_exports, {
  isValidHex: () => isValidHex,
  prefixHex: () => prefixHex
});
module.exports = __toCommonJS(is_valid_hex_exports);
var HEX_REGEX = /^[0-9a-fA-F]{3,8}$/;
function isValidHex(value) {
  return HEX_REGEX.test(value);
}
function prefixHex(value) {
  if (value.startsWith("#")) return value;
  if (isValidHex(value)) return `#${value}`;
  return value;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isValidHex,
  prefixHex
});
