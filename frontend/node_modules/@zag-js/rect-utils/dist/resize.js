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

// src/resize.ts
var resize_exports = {};
__export(resize_exports, {
  resizeRect: () => resizeRect
});
module.exports = __toCommonJS(resize_exports);
var import_affine_transform = require("./affine-transform.js");
var import_compass = require("./compass.js");
var { sign, abs, min } = Math;
function getRectExtentPoint(rect, direction) {
  const { minX, minY, maxX, maxY, midX, midY } = rect;
  const x = direction.includes("w") ? minX : direction.includes("e") ? maxX : midX;
  const y = direction.includes("n") ? minY : direction.includes("s") ? maxY : midY;
  return { x, y };
}
function getOppositeDirection(direction) {
  return import_compass.oppositeDirectionMap[direction];
}
function resizeRect(rect, offset, direction, opts) {
  const { scalingOriginMode, lockAspectRatio } = opts;
  const extent = getRectExtentPoint(rect, direction);
  const oppositeDirection = getOppositeDirection(direction);
  const oppositeExtent = getRectExtentPoint(rect, oppositeDirection);
  if (scalingOriginMode === "center") {
    offset = { x: offset.x * 2, y: offset.y * 2 };
  }
  const newExtent = {
    x: extent.x + offset.x,
    y: extent.y + offset.y
  };
  const multiplier = {
    x: import_compass.compassDirectionMap[direction].x * 2 - 1,
    y: import_compass.compassDirectionMap[direction].y * 2 - 1
  };
  const newSize = {
    width: newExtent.x - oppositeExtent.x,
    height: newExtent.y - oppositeExtent.y
  };
  const scaleX = multiplier.x * newSize.width / rect.width;
  const scaleY = multiplier.y * newSize.height / rect.height;
  const largestMagnitude = abs(scaleX) > abs(scaleY) ? scaleX : scaleY;
  const scale = lockAspectRatio ? { x: largestMagnitude, y: largestMagnitude } : {
    x: extent.x === oppositeExtent.x ? 1 : scaleX,
    y: extent.y === oppositeExtent.y ? 1 : scaleY
  };
  if (extent.y === oppositeExtent.y) {
    scale.y = abs(scale.y);
  } else if (sign(scale.y) !== sign(scaleY)) {
    scale.y *= -1;
  }
  if (extent.x === oppositeExtent.x) {
    scale.x = abs(scale.x);
  } else if (sign(scale.x) !== sign(scaleX)) {
    scale.x *= -1;
  }
  switch (scalingOriginMode) {
    case "extent":
      return transformRect(rect, import_affine_transform.AffineTransform.scale(scale.x, scale.y, oppositeExtent), false);
    case "center":
      return transformRect(
        rect,
        import_affine_transform.AffineTransform.scale(scale.x, scale.y, {
          x: rect.midX,
          y: rect.midY
        }),
        false
      );
  }
}
function createRectFromPoints(initialPoint, finalPoint, normalized = true) {
  if (normalized) {
    return {
      x: min(finalPoint.x, initialPoint.x),
      y: min(finalPoint.y, initialPoint.y),
      width: abs(finalPoint.x - initialPoint.x),
      height: abs(finalPoint.y - initialPoint.y)
    };
  }
  return {
    x: initialPoint.x,
    y: initialPoint.y,
    width: finalPoint.x - initialPoint.x,
    height: finalPoint.y - initialPoint.y
  };
}
function transformRect(rect, transform, normalized = true) {
  const p1 = transform.applyTo({ x: rect.minX, y: rect.minY });
  const p2 = transform.applyTo({ x: rect.maxX, y: rect.maxY });
  return createRectFromPoints(p1, p2, normalized);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  resizeRect
});
