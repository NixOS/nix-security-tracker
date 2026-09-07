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

// src/from-window.ts
var from_window_exports = {};
__export(from_window_exports, {
  getViewportRect: () => getViewportRect,
  getWindowRect: () => getWindowRect
});
module.exports = __toCommonJS(from_window_exports);
var import_rect = require("./rect.js");
function getWindowRect(win, opts = {}) {
  return (0, import_rect.createRect)(getViewportRect(win, opts));
}
function getViewportRect(win, opts) {
  const { excludeScrollbar = false } = opts;
  const { innerWidth, innerHeight, document: doc, visualViewport } = win;
  const width = visualViewport?.width || innerWidth;
  const height = visualViewport?.height || innerHeight;
  const rect = { x: 0, y: 0, width, height };
  if (excludeScrollbar) {
    const scrollbarWidth = innerWidth - doc.documentElement.clientWidth;
    const scrollbarHeight = innerHeight - doc.documentElement.clientHeight;
    rect.width -= scrollbarWidth;
    rect.height -= scrollbarHeight;
  }
  return rect;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getViewportRect,
  getWindowRect
});
