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

// src/highlight.ts
var highlight_exports = {};
__export(highlight_exports, {
  highlightWord: () => highlightWord
});
module.exports = __toCommonJS(highlight_exports);
var import_highlight_first = require("./highlight-first.js");
var import_highlight_multiple = require("./highlight-multiple.js");
var highlightWord = (props) => {
  if (props.matchAll == null) {
    props.matchAll = Array.isArray(props.query);
  }
  if (!props.matchAll && Array.isArray(props.query)) {
    throw new Error("matchAll must be true when using multiple queries");
  }
  return props.matchAll ? (0, import_highlight_multiple.highlightMultiple)(props) : (0, import_highlight_first.highlightFirst)(props);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  highlightWord
});
