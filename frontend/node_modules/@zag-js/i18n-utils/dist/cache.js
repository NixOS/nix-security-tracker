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

// src/cache.ts
var cache_exports = {};
__export(cache_exports, {
  i18nCache: () => i18nCache
});
module.exports = __toCommonJS(cache_exports);
function i18nCache(Ins) {
  const formatterCache = /* @__PURE__ */ new Map();
  return function create(locale, options) {
    const cacheKey = locale + (options ? Object.entries(options).sort((a, b) => a[0] < b[0] ? -1 : 1).join() : "");
    if (formatterCache.has(cacheKey)) {
      return formatterCache.get(cacheKey);
    }
    let formatter = new Ins(locale, options);
    formatterCache.set(cacheKey, formatter);
    return formatter;
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  i18nCache
});
