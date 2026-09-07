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

// src/intersection.ts
var intersection_exports = {};
__export(intersection_exports, {
  collisions: () => collisions,
  intersection: () => intersection,
  intersects: () => intersects
});
module.exports = __toCommonJS(intersection_exports);
var import_rect = require("./rect.js");
function intersects(a, b) {
  return a.x < b.maxX && a.y < b.maxY && a.maxX > b.x && a.maxY > b.y;
}
function intersection(a, b) {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.width, b.x + b.width);
  const y2 = Math.min(a.y + a.height, b.y + b.height);
  return (0, import_rect.createRect)({ x, y, width: x2 - x, height: y2 - y });
}
function collisions(a, b) {
  return {
    top: a.minY <= b.minY,
    right: a.maxX >= b.maxX,
    bottom: a.maxY >= b.maxY,
    left: a.minX <= b.minX
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  collisions,
  intersection,
  intersects
});
