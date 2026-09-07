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

// src/constrain.ts
var constrain_exports = {};
__export(constrain_exports, {
  constrainRect: () => constrainRect
});
module.exports = __toCommonJS(constrain_exports);
var constrainRect = (rect, boundary) => {
  const left = Math.max(boundary.x, Math.min(rect.x, boundary.x + boundary.width - rect.width));
  const top = Math.max(boundary.y, Math.min(rect.y, boundary.y + boundary.height - rect.height));
  return {
    x: left,
    y: top,
    width: Math.min(rect.width, boundary.width),
    height: Math.min(rect.height, boundary.height)
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  constrainRect
});
