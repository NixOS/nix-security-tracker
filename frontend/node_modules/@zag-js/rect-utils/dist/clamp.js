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

// src/clamp.ts
var clamp_exports = {};
__export(clamp_exports, {
  clampPoint: () => clampPoint,
  clampSize: () => clampSize
});
module.exports = __toCommonJS(clamp_exports);
var clamp = (value, min, max) => Math.min(Math.max(value, min), max);
var clampPoint = (position, size, boundaryRect) => {
  const x = clamp(position.x, boundaryRect.x, boundaryRect.x + boundaryRect.width - size.width);
  const y = clamp(position.y, boundaryRect.y, boundaryRect.y + boundaryRect.height - size.height);
  return { x, y };
};
var defaultMinSize = {
  width: 0,
  height: 0
};
var defaultMaxSize = {
  width: Infinity,
  height: Infinity
};
var clampSize = (size, minSize = defaultMinSize, maxSize = defaultMaxSize) => {
  return {
    width: Math.min(Math.max(size.width, minSize.width), maxSize.width),
    height: Math.min(Math.max(size.height, minSize.height), maxSize.height)
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  clampPoint,
  clampSize
});
