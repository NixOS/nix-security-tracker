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

// src/align.ts
var align_exports = {};
__export(align_exports, {
  alignRect: () => alignRect
});
module.exports = __toCommonJS(align_exports);
function hAlign(a, ref, h) {
  let x = ref.minX;
  if (h === "left-inside") x = ref.minX;
  if (h === "left-outside") x = ref.minX - ref.width;
  if (h === "right-inside") x = ref.maxX - ref.width;
  if (h === "right-outside") x = ref.maxX;
  if (h === "center") x = ref.midX - ref.width / 2;
  return { ...a, x };
}
function vAlign(a, ref, v) {
  let y = ref.minY;
  if (v === "top-inside") y = ref.minY;
  if (v === "top-outside") y = ref.minY - a.height;
  if (v === "bottom-inside") y = ref.maxY - a.height;
  if (v === "bottom-outside") y = ref.maxY;
  if (v === "center") y = ref.midY - a.height / 2;
  return { ...a, y };
}
function alignRect(a, ref, options) {
  const { h, v } = options;
  return vAlign(hAlign(a, ref, h), ref, v);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  alignRect
});
