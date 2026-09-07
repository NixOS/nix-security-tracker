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

// src/closest.ts
var closest_exports = {};
__export(closest_exports, {
  closest: () => closest,
  closestSideToPoint: () => closestSideToPoint,
  closestSideToRect: () => closestSideToRect
});
module.exports = __toCommonJS(closest_exports);
var import_distance = require("./distance.js");
function closest(...pts) {
  return (a) => {
    const ds = pts.map((b) => (0, import_distance.distance)(b, a));
    const c = Math.min.apply(Math, ds);
    return pts[ds.indexOf(c)];
  };
}
function closestSideToRect(ref, r) {
  if (r.maxX <= ref.minX) return "left";
  if (r.minX >= ref.maxX) return "right";
  if (r.maxY <= ref.minY) return "top";
  if (r.minY >= ref.maxY) return "bottom";
  return "left";
}
function closestSideToPoint(ref, p) {
  const { x, y } = p;
  const dl = x - ref.minX;
  const dr = ref.maxX - x;
  const dt = y - ref.minY;
  const db = ref.maxY - y;
  let closest2 = dl;
  let side = "left";
  if (dr < closest2) {
    closest2 = dr;
    side = "right";
  }
  if (dt < closest2) {
    closest2 = dt;
    side = "top";
  }
  if (db < closest2) {
    side = "bottom";
  }
  return side;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  closest,
  closestSideToPoint,
  closestSideToRect
});
