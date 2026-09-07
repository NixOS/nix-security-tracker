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

// src/format-list.ts
var format_list_exports = {};
__export(format_list_exports, {
  formatList: () => formatList
});
module.exports = __toCommonJS(format_list_exports);
var import_cache = require("./cache.js");
var getListFormatter = (0, import_cache.i18nCache)(Intl.ListFormat);
function formatList(list, locale, options = {}) {
  const formatter = getListFormatter(locale, options);
  return formatter.format(list);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  formatList
});
