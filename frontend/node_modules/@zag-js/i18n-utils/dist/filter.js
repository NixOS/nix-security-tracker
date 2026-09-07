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

// src/filter.ts
var filter_exports = {};
__export(filter_exports, {
  createFilter: () => createFilter
});
module.exports = __toCommonJS(filter_exports);
var import_cache = require("./cache.js");
var collatorCache = (0, import_cache.i18nCache)(Intl.Collator);
function createFilter(options) {
  const { locale, ...rest } = options || {};
  const collator = collatorCache(locale || "en-US", { usage: "search", ...rest });
  function normalize(string) {
    string = string.normalize("NFC");
    if (collator.resolvedOptions().ignorePunctuation) {
      string = string.replace(/\p{P}/gu, "");
    }
    return string;
  }
  function startsWith(string, substring) {
    if (substring.length === 0) return true;
    string = normalize(string);
    substring = normalize(substring);
    return collator.compare(string.slice(0, substring.length), substring) === 0;
  }
  function endsWith(string, substring) {
    if (substring.length === 0) return true;
    string = normalize(string);
    substring = normalize(substring);
    return collator.compare(string.slice(-substring.length), substring) === 0;
  }
  function contains(string, substring) {
    if (substring.length === 0) return true;
    string = normalize(string);
    substring = normalize(substring);
    let scan = 0;
    let sliceLen = substring.length;
    for (; scan + sliceLen <= string.length; scan++) {
      let slice = string.slice(scan, scan + sliceLen);
      if (collator.compare(substring, slice) === 0) {
        return true;
      }
    }
    return false;
  }
  return {
    startsWith,
    endsWith,
    contains
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createFilter
});
