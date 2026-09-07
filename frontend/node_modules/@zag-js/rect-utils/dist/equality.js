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

// src/equality.ts
var equality_exports = {};
__export(equality_exports, {
  isPointEqual: () => isPointEqual,
  isRectEqual: () => isRectEqual,
  isSizeEqual: () => isSizeEqual
});
module.exports = __toCommonJS(equality_exports);
var isSizeEqual = (a, b) => {
  return a.width === b?.width && a.height === b?.height;
};
var isPointEqual = (a, b) => {
  return a.x === b?.x && a.y === b?.y;
};
var isRectEqual = (a, b) => {
  return isPointEqual(a, b) && isSizeEqual(a, b);
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  isPointEqual,
  isRectEqual,
  isSizeEqual
});
