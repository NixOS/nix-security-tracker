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
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  getDefaultLocale: () => import_locale.getDefaultLocale,
  getLocaleDir: () => import_is_rtl.getLocaleDir,
  isRTL: () => import_is_rtl.isRTL,
  trackLocale: () => import_track_locale.trackLocale
});
module.exports = __toCommonJS(index_exports);
__reExport(index_exports, require("./collator.js"), module.exports);
__reExport(index_exports, require("./filter.js"), module.exports);
__reExport(index_exports, require("./format-bytes.js"), module.exports);
__reExport(index_exports, require("./format-date.js"), module.exports);
__reExport(index_exports, require("./format-list.js"), module.exports);
__reExport(index_exports, require("./format-number.js"), module.exports);
__reExport(index_exports, require("./format-relative-time.js"), module.exports);
__reExport(index_exports, require("./format-time.js"), module.exports);
var import_is_rtl = require("./is-rtl.js");
var import_locale = require("./locale.js");
var import_track_locale = require("./track-locale.js");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getDefaultLocale,
  getLocaleDir,
  isRTL,
  trackLocale,
  ...require("./collator.js"),
  ...require("./filter.js"),
  ...require("./format-bytes.js"),
  ...require("./format-date.js"),
  ...require("./format-list.js"),
  ...require("./format-number.js"),
  ...require("./format-relative-time.js"),
  ...require("./format-time.js")
});
