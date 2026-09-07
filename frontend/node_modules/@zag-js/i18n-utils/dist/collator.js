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

// src/collator.ts
var collator_exports = {};
__export(collator_exports, {
  createCollator: () => createCollator
});
module.exports = __toCommonJS(collator_exports);
var import_cache = require("./cache.js");
var getCollator = (0, import_cache.i18nCache)(Intl.Collator);
function createCollator(locale = "en-US", options = {}) {
  return getCollator(locale, options);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createCollator
});
