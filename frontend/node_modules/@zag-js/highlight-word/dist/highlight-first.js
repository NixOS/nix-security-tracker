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

// src/highlight-first.ts
var highlight_first_exports = {};
__export(highlight_first_exports, {
  highlightFirst: () => highlightFirst
});
module.exports = __toCommonJS(highlight_first_exports);
var import_normalize_span = require("./normalize-span.js");
var import_escape_regex = require("./escape-regex.js");
function highlightFirst(props) {
  const { text, query, ignoreCase, exactMatch } = props;
  if (exactMatch) {
    const escapedQuery = (0, import_escape_regex.escapeRegex)(query);
    const regex = new RegExp(`\\b(${escapedQuery})\\b`, ignoreCase ? "i" : "");
    const match = text.match(regex);
    if (!match || match.index === void 0) {
      return [{ text, match: false }];
    }
    const start2 = match.index;
    const end2 = start2 + match[0].length;
    const spans2 = [{ start: start2, end: end2 }];
    return (0, import_normalize_span.normalizeSpan)(spans2, text.length).map((chunk) => ({
      text: text.slice(chunk.start, chunk.end),
      match: !!chunk.match
    }));
  }
  const searchText = ignoreCase ? text.toLowerCase() : text;
  const searchQuery = ignoreCase ? typeof query === "string" ? query.toLowerCase() : query : query;
  const start = typeof searchText === "string" ? searchText.indexOf(searchQuery) : -1;
  if (start === -1) {
    return [{ text, match: false }];
  }
  const end = start + searchQuery.length;
  const spans = [{ start, end }];
  return (0, import_normalize_span.normalizeSpan)(spans, text.length).map((chunk) => ({
    text: text.slice(chunk.start, chunk.end),
    match: !!chunk.match
  }));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  highlightFirst
});
