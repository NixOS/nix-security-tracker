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

// src/searchable.ts
var searchable_exports = {};
__export(searchable_exports, {
  getByText: () => getByText
});
module.exports = __toCommonJS(searchable_exports);
var import_query = require("./query.js");
var import_shared = require("./shared.js");
var sanitize = (str) => str.split("").map((char) => {
  const code = char.charCodeAt(0);
  if (code > 0 && code < 128) return char;
  if (code >= 128 && code <= 255) return `/x${code.toString(16)}`.replace("/", "\\");
  return "";
}).join("").trim();
var getValueText = (el) => {
  return sanitize(el.dataset?.valuetext ?? el.textContent ?? "");
};
var match = (valueText, query) => {
  return valueText.trim().toLowerCase().startsWith(query.toLowerCase());
};
function getByText(v, text, currentId, itemToId = import_query.defaultItemToId) {
  const index = currentId ? (0, import_query.indexOfId)(v, currentId, itemToId) : -1;
  let items = currentId ? (0, import_shared.wrap)(v, index) : v;
  const isSingleKey = text.length === 1;
  if (isSingleKey) {
    items = items.filter((item) => itemToId(item) !== currentId);
  }
  return items.find((item) => match(getValueText(item), text));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getByText
});
