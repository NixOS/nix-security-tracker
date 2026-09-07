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

// src/scroll.ts
var scroll_exports = {};
__export(scroll_exports, {
  getScrollPosition: () => getScrollPosition,
  scrollIntoView: () => scrollIntoView,
  scrollToElement: () => scrollToElement
});
module.exports = __toCommonJS(scroll_exports);
var import_node = require("./node.js");
var import_overflow = require("./overflow.js");
function isScrollable(el) {
  return el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;
}
function scrollIntoView(el, options) {
  const { rootEl, ...scrollOptions } = options || {};
  if (!el || !rootEl) return;
  if (!(0, import_overflow.isOverflowElement)(rootEl) || !isScrollable(rootEl)) return;
  el.scrollIntoView(scrollOptions);
}
function scrollToElement(el, options) {
  const { rootEl, behavior } = options || {};
  if (!el || !rootEl) return false;
  if (!rootEl.contains(el)) return false;
  const win = (0, import_node.getWindow)(rootEl);
  const rootRect = rootEl.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const rootStyle = win.getComputedStyle(rootEl);
  const elStyle = win.getComputedStyle(el);
  const scrollPaddingTop = getNumericStyle(rootStyle.scrollPaddingBlockStart || rootStyle.scrollPaddingTop);
  const scrollMarginTop = getNumericStyle(elStyle.scrollMarginBlockStart || elStyle.scrollMarginTop);
  const top = elRect.top - rootRect.top + rootEl.scrollTop - scrollPaddingTop - scrollMarginTop;
  rootEl.scrollTo({ top, ...behavior && { behavior } });
  return true;
}
var getNumericStyle = (value) => {
  const numericValue = Number.parseFloat(value);
  return Number.isNaN(numericValue) ? 0 : numericValue;
};
function getScrollPosition(element) {
  if ((0, import_node.isHTMLElement)(element)) {
    return { scrollLeft: element.scrollLeft, scrollTop: element.scrollTop };
  }
  return { scrollLeft: element.scrollX, scrollTop: element.scrollY };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getScrollPosition,
  scrollIntoView,
  scrollToElement
});
