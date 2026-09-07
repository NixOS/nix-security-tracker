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

// src/cascade-select.utils.ts
var cascade_select_utils_exports = {};
__export(cascade_select_utils_exports, {
  createGraceArea: () => createGraceArea,
  isPointerInGraceArea: () => isPointerInGraceArea
});
module.exports = __toCommonJS(cascade_select_utils_exports);
var import_rect_utils = require("@zag-js/rect-utils");
function createGraceArea(exitPoint, triggerRect, targetRect, options = {}) {
  const { padding = 5 } = options;
  const triggerRectObj = (0, import_rect_utils.createRect)({
    x: triggerRect.left,
    y: triggerRect.top,
    width: triggerRect.width,
    height: triggerRect.height
  });
  const exitSide = (0, import_rect_utils.closestSideToPoint)(triggerRectObj, exitPoint);
  const paddedExitPoints = getPaddedExitPoints(exitPoint, exitSide, padding);
  const targetPoints = domRectToPoints(targetRect);
  return getConvexHull([...paddedExitPoints, ...targetPoints]);
}
function isPointerInGraceArea(point, graceArea) {
  return (0, import_rect_utils.isPointInPolygon)(graceArea, point);
}
function getPaddedExitPoints(exitPoint, exitSide, padding) {
  const { x, y } = exitPoint;
  switch (exitSide) {
    case "top":
      return [(0, import_rect_utils.createPoint)(x - padding, y + padding), (0, import_rect_utils.createPoint)(x + padding, y + padding)];
    case "bottom":
      return [(0, import_rect_utils.createPoint)(x - padding, y - padding), (0, import_rect_utils.createPoint)(x + padding, y - padding)];
    case "left":
      return [(0, import_rect_utils.createPoint)(x + padding, y - padding), (0, import_rect_utils.createPoint)(x + padding, y + padding)];
    case "right":
      return [(0, import_rect_utils.createPoint)(x - padding, y - padding), (0, import_rect_utils.createPoint)(x - padding, y + padding)];
    default:
      return [];
  }
}
function domRectToPoints(rect) {
  const rectObj = (0, import_rect_utils.createRect)({
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height
  });
  const corners = (0, import_rect_utils.getRectCorners)(rectObj);
  return [corners.top, corners.right, corners.bottom, corners.left];
}
function getConvexHull(points) {
  if (points.length <= 1) return points.slice();
  const sortedPoints = points.slice().sort((a, b) => {
    if (a.x !== b.x) return a.x - b.x;
    return a.y - b.y;
  });
  const lower = [];
  for (const point of sortedPoints) {
    while (lower.length >= 2 && crossProduct(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
      lower.pop();
    }
    lower.push(point);
  }
  const upper = [];
  for (let i = sortedPoints.length - 1; i >= 0; i--) {
    const point = sortedPoints[i];
    while (upper.length >= 2 && crossProduct(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
      upper.pop();
    }
    upper.push(point);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}
function crossProduct(o, a, b) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createGraceArea,
  isPointerInGraceArea
});
