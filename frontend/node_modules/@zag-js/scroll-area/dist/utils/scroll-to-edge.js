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

// src/utils/scroll-to-edge.ts
var scroll_to_edge_exports = {};
__export(scroll_to_edge_exports, {
  scrollToEdge: () => scrollToEdge
});
module.exports = __toCommonJS(scroll_to_edge_exports);
var import_utils = require("@zag-js/utils");
var import_smooth_scroll = require("./smooth-scroll.js");
function scrollToEdge(node, edge, dir, behavior = "smooth", easing, duration) {
  if (!node) return;
  const maxLeft = node.scrollWidth - node.clientWidth;
  const maxTop = node.scrollHeight - node.clientHeight;
  const isRtl = dir === "rtl";
  let targetScrollTop;
  let targetScrollLeft;
  switch (edge) {
    case "top":
      targetScrollTop = 0;
      break;
    case "bottom":
      targetScrollTop = maxTop;
      break;
    case "left":
      if (isRtl) {
        const negative = node.scrollLeft <= 0;
        targetScrollLeft = negative ? -maxLeft : 0;
      } else {
        targetScrollLeft = 0;
      }
      break;
    case "right":
      if (isRtl) {
        const negative = node.scrollLeft <= 0;
        targetScrollLeft = negative ? 0 : maxLeft;
      } else {
        targetScrollLeft = maxLeft;
      }
      break;
  }
  if (behavior === "smooth") {
    (0, import_smooth_scroll.smoothScroll)(node, { top: targetScrollTop, left: targetScrollLeft, easing, duration });
  } else {
    const options = (0, import_utils.compact)({ left: targetScrollLeft, top: targetScrollTop, behavior });
    node.scrollTo(options);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  scrollToEdge
});
