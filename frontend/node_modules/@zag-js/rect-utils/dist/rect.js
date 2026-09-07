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

// src/rect.ts
var rect_exports = {};
__export(rect_exports, {
  addPoints: () => addPoints,
  createPoint: () => createPoint,
  createRect: () => createRect,
  getRectCenters: () => getRectCenters,
  getRectCorners: () => getRectCorners,
  getRectEdges: () => getRectEdges,
  isPoint: () => isPoint,
  isRect: () => isRect,
  subtractPoints: () => subtractPoints
});
module.exports = __toCommonJS(rect_exports);
var createPoint = (x, y) => ({ x, y });
var subtractPoints = (a, b) => {
  if (!b) return a;
  return createPoint(a.x - b.x, a.y - b.y);
};
var addPoints = (a, b) => createPoint(a.x + b.x, a.y + b.y);
function isPoint(v) {
  return Reflect.has(v, "x") && Reflect.has(v, "y");
}
function createRect(r) {
  const { x, y, width, height } = r;
  const midX = x + width / 2;
  const midY = y + height / 2;
  return {
    x,
    y,
    width,
    height,
    minX: x,
    minY: y,
    maxX: x + width,
    maxY: y + height,
    midX,
    midY,
    center: createPoint(midX, midY)
  };
}
function isRect(v) {
  return Reflect.has(v, "x") && Reflect.has(v, "y") && Reflect.has(v, "width") && Reflect.has(v, "height");
}
function getRectCenters(v) {
  const top = createPoint(v.midX, v.minY);
  const right = createPoint(v.maxX, v.midY);
  const bottom = createPoint(v.midX, v.maxY);
  const left = createPoint(v.minX, v.midY);
  return { top, right, bottom, left };
}
function getRectCorners(v) {
  const top = createPoint(v.minX, v.minY);
  const right = createPoint(v.maxX, v.minY);
  const bottom = createPoint(v.maxX, v.maxY);
  const left = createPoint(v.minX, v.maxY);
  return { top, right, bottom, left };
}
function getRectEdges(v) {
  const c = getRectCorners(v);
  const top = [c.top, c.right];
  const right = [c.right, c.bottom];
  const bottom = [c.left, c.bottom];
  const left = [c.top, c.left];
  return { top, right, bottom, left };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  addPoints,
  createPoint,
  createRect,
  getRectCenters,
  getRectCorners,
  getRectEdges,
  isPoint,
  isRect,
  subtractPoints
});
