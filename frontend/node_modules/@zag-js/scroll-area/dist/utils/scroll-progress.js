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

// src/utils/scroll-progress.ts
var scroll_progress_exports = {};
__export(scroll_progress_exports, {
  getScrollProgress: () => getScrollProgress
});
module.exports = __toCommonJS(scroll_progress_exports);
function getScrollProgress(element, scrollThreshold) {
  if (!element) return EMPTY_SCROLL_PROGRESS;
  let progressX = 0;
  let progressY = 0;
  const maxScrollX = element.scrollWidth - element.clientWidth;
  if (maxScrollX > scrollThreshold) {
    progressX = Math.min(1, Math.max(0, element.scrollLeft / maxScrollX));
  }
  const maxScrollY = element.scrollHeight - element.clientHeight;
  if (maxScrollY > scrollThreshold) {
    progressY = Math.min(1, Math.max(0, element.scrollTop / maxScrollY));
  }
  return { x: progressX, y: progressY };
}
var EMPTY_SCROLL_PROGRESS = { x: 0, y: 0 };
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getScrollProgress
});
