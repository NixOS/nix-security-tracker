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

// src/highlight-multiple.ts
var highlight_multiple_exports = {};
__export(highlight_multiple_exports, {
  highlightMultiple: () => highlightMultiple
});
module.exports = __toCommonJS(highlight_multiple_exports);
var import_normalize_span = require("./normalize-span.js");
var import_escape_regex = require("./escape-regex.js");
var buildRegex = (queryProp, flags, exactMatch) => {
  const query = queryProp.filter(Boolean).map((text) => (0, import_escape_regex.escapeRegex)(text));
  const pattern = exactMatch ? `\\b(${query.join("|")})\\b` : `(${query.join("|")})`;
  return new RegExp(pattern, flags);
};
var getRegexFlags = (ignoreCase, matchAll = true) => `${ignoreCase ? "i" : ""}${matchAll ? "g" : ""}`;
function highlightMultiple(props) {
  const { text, query, ignoreCase, matchAll, exactMatch } = props;
  if (query.length === 0) {
    return [{ text, match: false }];
  }
  const flags = getRegexFlags(ignoreCase, matchAll);
  const regex = buildRegex(Array.isArray(query) ? query : [query], flags, exactMatch);
  const spans = [...text.matchAll(regex)].map((match) => ({
    start: match.index || 0,
    end: (match.index || 0) + match[0].length
  }));
  return (0, import_normalize_span.normalizeSpan)(spans, props.text.length).map((chunk) => ({
    text: props.text.slice(chunk.start, chunk.end),
    match: !!chunk.match
  }));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  highlightMultiple
});
