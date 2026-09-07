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

// src/shared.ts
var shared_exports = {};
__export(shared_exports, {
  defu: () => defu,
  getProp: () => getProp,
  hasProp: () => hasProp,
  hash: () => hash,
  isObj: () => isObj,
  typeOf: () => typeOf
});
module.exports = __toCommonJS(shared_exports);
var regexReturnCharacters = /\r/g;
function hash(str) {
  const v = str.replace(regexReturnCharacters, "");
  let hash2 = 5381;
  let i = v.length;
  while (i--) hash2 = (hash2 << 5) - hash2 ^ v.charCodeAt(i);
  return (hash2 >>> 0).toString(36);
}
function hasProp(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}
function getProp(value, key) {
  return value[key];
}
function defu(a, b) {
  const res = { ...a };
  for (const key in b) {
    if (b[key] !== void 0) res[key] = b[key];
  }
  return res;
}
var isObj = (v) => v != null && typeof v === "object" && !Array.isArray(v);
var typeOf = (value) => Object.prototype.toString.call(value);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  defu,
  getProp,
  hasProp,
  hash,
  isObj,
  typeOf
});
