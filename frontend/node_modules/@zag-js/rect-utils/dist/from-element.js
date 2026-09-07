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

// src/from-element.ts
var from_element_exports = {};
__export(from_element_exports, {
  getElementRect: () => getElementRect
});
module.exports = __toCommonJS(from_element_exports);
var import_rect = require("./rect.js");
var styleCache = /* @__PURE__ */ new WeakMap();
function getCacheComputedStyle(el) {
  if (!styleCache.has(el)) {
    const win = el.ownerDocument.defaultView || window;
    styleCache.set(el, win.getComputedStyle(el));
  }
  return styleCache.get(el);
}
function getElementRect(el, opts = {}) {
  return (0, import_rect.createRect)(getClientRect(el, opts));
}
function getClientRect(el, opts = {}) {
  const { excludeScrollbar = false, excludeBorders = false } = opts;
  const { x, y, width, height } = el.getBoundingClientRect();
  const r = { x, y, width, height };
  const style = getCacheComputedStyle(el);
  const { borderLeftWidth, borderTopWidth, borderRightWidth, borderBottomWidth } = style;
  const borderXWidth = sum(borderLeftWidth, borderRightWidth);
  const borderYWidth = sum(borderTopWidth, borderBottomWidth);
  if (excludeBorders) {
    r.width -= borderXWidth;
    r.height -= borderYWidth;
    r.x += px(borderLeftWidth);
    r.y += px(borderTopWidth);
  }
  if (excludeScrollbar) {
    const scrollbarWidth = el.offsetWidth - el.clientWidth - borderXWidth;
    const scrollbarHeight = el.offsetHeight - el.clientHeight - borderYWidth;
    r.width -= scrollbarWidth;
    r.height -= scrollbarHeight;
  }
  return r;
}
var px = (v) => parseFloat(v.replace("px", ""));
var sum = (...vals) => vals.reduce((sum2, v) => sum2 + (v ? px(v) : 0), 0);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getElementRect
});
