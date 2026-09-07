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

// src/from-range.ts
var from_range_exports = {};
__export(from_range_exports, {
  fromRange: () => fromRange
});
module.exports = __toCommonJS(from_range_exports);
var import_rect = require("./rect.js");
var import_from_element = require("./from-element.js");
var import_union = require("./union.js");
function fromRange(range) {
  let rs = [];
  const rects = Array.from(range.getClientRects());
  if (rects.length) {
    rs = rs.concat(rects.map(import_rect.createRect));
    return import_union.union.apply(void 0, rs);
  }
  let start = range.startContainer;
  if (start.nodeType === Node.TEXT_NODE) {
    start = start.parentNode;
  }
  if (start instanceof HTMLElement) {
    const r = (0, import_from_element.getElementRect)(start);
    rs.push({ ...r, x: r.maxX, width: 0 });
  }
  return import_union.union.apply(void 0, rs);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  fromRange
});
