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

// src/locale.ts
var locale_exports = {};
__export(locale_exports, {
  getDefaultLocale: () => getDefaultLocale
});
module.exports = __toCommonJS(locale_exports);
var import_is_rtl = require("./is-rtl.js");
function getDefaultLocale() {
  let locale = typeof navigator !== "undefined" && (navigator.language || navigator.userLanguage) || "en-US";
  try {
    Intl.DateTimeFormat.supportedLocalesOf([locale]);
  } catch {
    locale = "en-US";
  }
  return {
    locale,
    dir: (0, import_is_rtl.isRTL)(locale) ? "rtl" : "ltr"
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getDefaultLocale
});
