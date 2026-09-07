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

// src/utils/scroll-sides.ts
var scroll_sides_exports = {};
__export(scroll_sides_exports, {
  getScrollSides: () => getScrollSides
});
module.exports = __toCommonJS(scroll_sides_exports);
function getScrollSides(node, dir) {
  const scrollTop = node.scrollTop;
  const scrollLeft = node.scrollLeft;
  const isRtl = dir === "rtl";
  const threshold = 1;
  const hasVerticalScroll = node.scrollHeight - node.clientHeight > threshold;
  const hasHorizontalScroll = node.scrollWidth - node.clientWidth > threshold;
  const maxScrollLeft = node.scrollWidth - node.clientWidth;
  const maxScrollTop = node.scrollHeight - node.clientHeight;
  let atLeft = false;
  let atRight = false;
  let atTop = false;
  let atBottom = false;
  if (hasHorizontalScroll) {
    if (isRtl) {
      if (scrollLeft <= 0) {
        atLeft = Math.abs(scrollLeft) >= maxScrollLeft - threshold;
        atRight = Math.abs(scrollLeft) <= threshold;
      } else {
        atLeft = scrollLeft <= threshold;
        atRight = scrollLeft >= maxScrollLeft - threshold;
      }
    } else {
      atLeft = scrollLeft <= threshold;
      atRight = scrollLeft >= maxScrollLeft - threshold;
    }
  }
  if (hasVerticalScroll) {
    atTop = scrollTop <= threshold;
    atBottom = scrollTop >= maxScrollTop - threshold;
  }
  return {
    top: atTop,
    right: atRight,
    bottom: atBottom,
    left: atLeft
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getScrollSides
});
