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

// src/track-locale.ts
var track_locale_exports = {};
__export(track_locale_exports, {
  trackLocale: () => trackLocale
});
module.exports = __toCommonJS(track_locale_exports);
var import_dom_query = require("@zag-js/dom-query");
var import_locale = require("./locale.js");
function trackLocale(options = {}) {
  const { getRootNode, onLocaleChange } = options;
  onLocaleChange?.((0, import_locale.getDefaultLocale)());
  const handleLocaleChange = () => {
    onLocaleChange?.((0, import_locale.getDefaultLocale)());
  };
  const win = getRootNode ? (0, import_dom_query.getWindow)(getRootNode()) : window;
  win.addEventListener("languagechange", handleLocaleChange);
  return () => {
    win.removeEventListener("languagechange", handleLocaleChange);
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  trackLocale
});
