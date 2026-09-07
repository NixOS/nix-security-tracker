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

// src/distance.ts
var distance_exports = {};
__export(distance_exports, {
  distance: () => distance,
  distanceBtwEdges: () => distanceBtwEdges,
  distanceFromPoint: () => distanceFromPoint,
  distanceFromRect: () => distanceFromRect
});
module.exports = __toCommonJS(distance_exports);
var import_intersection = require("./intersection.js");
function distance(a, b = { x: 0, y: 0 }) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}
function distanceFromPoint(r, p) {
  let x = 0;
  let y = 0;
  if (p.x < r.x) x = r.x - p.x;
  else if (p.x > r.maxX) x = p.x - r.maxX;
  if (p.y < r.y) y = r.y - p.y;
  else if (p.y > r.maxY) y = p.y - r.maxY;
  return { x, y, value: distance({ x, y }) };
}
function distanceFromRect(a, b) {
  if ((0, import_intersection.intersects)(a, b)) return { x: 0, y: 0, value: 0 };
  const left = a.x < b.x ? a : b;
  const right = b.x < a.x ? a : b;
  const upper = a.y < b.y ? a : b;
  const lower = b.y < a.y ? a : b;
  let x = left.x === right.x ? 0 : right.x - left.maxX;
  x = Math.max(0, x);
  let y = upper.y === lower.y ? 0 : lower.y - upper.maxY;
  y = Math.max(0, y);
  return { x, y, value: distance({ x, y }) };
}
function distanceBtwEdges(a, b) {
  return {
    left: b.x - a.x,
    top: b.y - a.y,
    right: a.maxX - b.maxX,
    bottom: a.maxY - b.maxY
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  distance,
  distanceBtwEdges,
  distanceFromPoint,
  distanceFromRect
});
