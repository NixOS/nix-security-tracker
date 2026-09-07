import "./chunk-QZ7TP4HQ.mjs";

// src/shared.ts
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
export {
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
};
