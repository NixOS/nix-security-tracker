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

// src/utils/scroll-to.ts
var scroll_to_exports = {};
__export(scroll_to_exports, {
  scrollTo: () => scrollTo
});
module.exports = __toCommonJS(scroll_to_exports);
var import_utils = require("@zag-js/utils");
var import_smooth_scroll = require("./smooth-scroll.js");
function scrollTo(node, options = {}) {
  if (!node) return;
  const { top, left, behavior = "smooth", easing, duration } = options;
  if (behavior === "smooth") {
    (0, import_smooth_scroll.smoothScroll)(node, { top, left, easing, duration });
  } else {
    const scrollOptions = (0, import_utils.compact)({ behavior, top, left });
    node.scrollTo(scrollOptions);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  scrollTo
});
