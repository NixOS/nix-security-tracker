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

// src/from-rotation.ts
var from_rotation_exports = {};
__export(from_rotation_exports, {
  getRotationRect: () => getRotationRect,
  rotate: () => rotate,
  toRad: () => toRad
});
module.exports = __toCommonJS(from_rotation_exports);
var import_rect = require("./rect.js");
function toRad(d) {
  return d % 360 * Math.PI / 180;
}
function rotate(a, d, c) {
  const r = toRad(d);
  const sin = Math.sin(r);
  const cos = Math.cos(r);
  const x = a.x - c.x;
  const y = a.y - c.y;
  return {
    x: c.x + x * cos - y * sin,
    y: c.y + x * sin + y * cos
  };
}
function getRotationRect(r, deg) {
  const rr = Object.values((0, import_rect.getRectCorners)(r)).map((p) => rotate(p, deg, r.center));
  const xs = rr.map((p) => p.x);
  const ys = rr.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  return (0, import_rect.createRect)({
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getRotationRect,
  rotate,
  toRad
});
