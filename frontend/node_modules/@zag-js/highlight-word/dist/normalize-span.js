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

// src/normalize-span.ts
var normalize_span_exports = {};
__export(normalize_span_exports, {
  normalizeSpan: () => normalizeSpan
});
module.exports = __toCommonJS(normalize_span_exports);
var normalizeSpan = (spans, len) => {
  const result = [];
  const append = (start, end, match) => {
    if (end - start > 0) result.push({ start, end, match });
  };
  if (spans.length === 0) {
    append(0, len, false);
  } else {
    let lastIndex = 0;
    for (const chunk of spans) {
      append(lastIndex, chunk.start, false);
      append(chunk.start, chunk.end, true);
      lastIndex = chunk.end;
    }
    append(lastIndex, len, false);
  }
  return result;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  normalizeSpan
});
