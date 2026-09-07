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

// src/contains.ts
var contains_exports = {};
__export(contains_exports, {
  contains: () => contains,
  containsPoint: () => containsPoint,
  containsRect: () => containsRect
});
module.exports = __toCommonJS(contains_exports);
var import_rect = require("./rect.js");
function containsPoint(r, p) {
  return r.minX <= p.x && p.x <= r.maxX && r.minY <= p.y && p.y <= r.maxY;
}
function containsRect(a, b) {
  return Object.values((0, import_rect.getRectCorners)(b)).every((c) => containsPoint(a, c));
}
function contains(r, v) {
  return (0, import_rect.isRect)(v) ? containsRect(r, v) : containsPoint(r, v);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  contains,
  containsPoint,
  containsRect
});
