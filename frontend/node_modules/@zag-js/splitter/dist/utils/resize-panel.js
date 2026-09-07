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

// src/utils/resize-panel.ts
var resize_panel_exports = {};
__export(resize_panel_exports, {
  resizePanel: () => resizePanel
});
module.exports = __toCommonJS(resize_panel_exports);
var import_utils = require("@zag-js/utils");
var import_fuzzy = require("./fuzzy.js");
function resizePanel({ panels, index, size }) {
  const panel = panels[index];
  (0, import_utils.ensure)(panel, () => `Panel data not found for index ${index}`);
  let { collapsedSize = 0, collapsible, maxSize = 100, minSize = 0 } = panel;
  if ((0, import_fuzzy.fuzzyCompareNumbers)(size, minSize) < 0) {
    if (collapsible) {
      const halfwayPoint = (collapsedSize + minSize) / 2;
      if ((0, import_fuzzy.fuzzyCompareNumbers)(size, halfwayPoint) < 0) {
        size = collapsedSize;
      } else {
        size = minSize;
      }
    } else {
      size = minSize;
    }
  }
  size = Math.min(maxSize, size);
  size = parseFloat(size.toFixed(import_fuzzy.PRECISION));
  return size;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  resizePanel
});
