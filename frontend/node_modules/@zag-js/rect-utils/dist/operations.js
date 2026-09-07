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

// src/operations.ts
var operations_exports = {};
__export(operations_exports, {
  expand: () => expand,
  inset: () => inset,
  isSymmetric: () => isSymmetric,
  shift: () => shift,
  shrink: () => shrink
});
module.exports = __toCommonJS(operations_exports);
var import_rect = require("./rect.js");
var isSymmetric = (v) => "dx" in v || "dy" in v;
function inset(r, i) {
  const v = isSymmetric(i) ? { left: i.dx, right: i.dx, top: i.dy, bottom: i.dy } : i;
  const { top = 0, right = 0, bottom = 0, left = 0 } = v;
  return (0, import_rect.createRect)({
    x: r.x + left,
    y: r.y + top,
    width: r.width - left - right,
    height: r.height - top - bottom
  });
}
function expand(r, v) {
  const value = typeof v === "number" ? { dx: -v, dy: -v } : v;
  return inset(r, value);
}
function shrink(r, v) {
  const value = typeof v === "number" ? { dx: -v, dy: -v } : v;
  return inset(r, value);
}
function shift(r, o) {
  const { x = 0, y = 0 } = o;
  return (0, import_rect.createRect)({
    x: r.x + x,
    y: r.y + y,
    width: r.width,
    height: r.height
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  expand,
  inset,
  isSymmetric,
  shift,
  shrink
});
