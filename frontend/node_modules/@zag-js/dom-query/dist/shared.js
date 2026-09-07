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

// src/shared.ts
var shared_exports = {};
__export(shared_exports, {
  MAX_Z_INDEX: () => MAX_Z_INDEX,
  ariaAttr: () => ariaAttr,
  clamp: () => clamp,
  dataAttr: () => dataAttr,
  getByOwnerId: () => getByOwnerId,
  isObject: () => isObject,
  isOwnedBy: () => isOwnedBy,
  noop: () => noop,
  pipe: () => pipe,
  sanitize: () => sanitize,
  wrap: () => wrap
});
module.exports = __toCommonJS(shared_exports);
var clamp = (value) => Math.max(0, Math.min(1, value));
var wrap = (v, idx) => {
  return v.map((_, index) => v[(Math.max(idx, 0) + index) % v.length]);
};
var pipe = (...fns) => (arg) => fns.reduce((acc, fn) => fn(acc), arg);
var noop = () => void 0;
var isObject = (v) => typeof v === "object" && v !== null;
var MAX_Z_INDEX = 2147483647;
var dataAttr = (guard) => guard ? "" : void 0;
var ariaAttr = (guard) => guard ? "true" : void 0;
var BACKSLASH_RE = /\\/g;
var DOUBLE_QUOTE_RE = /"/g;
var cssesc = (value) => globalThis.CSS?.escape?.(value) ?? value.replace(BACKSLASH_RE, "\\\\").replace(DOUBLE_QUOTE_RE, '\\"');
var getByOwnerId = (id) => `[data-ownedby~="${cssesc(String(id))}"]`;
var isOwnedBy = (el, id) => !!el?.matches(getByOwnerId(id));
var sanitize = (str) => str.split("").map((char) => {
  const code = char.charCodeAt(0);
  if (code > 0 && code < 128) return char;
  if (code >= 128 && code <= 255) return `/x${code.toString(16)}`.replace("/", "\\");
  return "";
}).join("").trim();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MAX_Z_INDEX,
  ariaAttr,
  clamp,
  dataAttr,
  getByOwnerId,
  isObject,
  isOwnedBy,
  noop,
  pipe,
  sanitize,
  wrap
});
