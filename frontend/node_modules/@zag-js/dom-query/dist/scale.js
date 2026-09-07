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

// src/scale.ts
var scale_exports = {};
__export(scale_exports, {
  getScale: () => getScale
});
module.exports = __toCommonJS(scale_exports);
function getScale(element) {
  const rect = element.getBoundingClientRect();
  const offsetWidth = element.offsetWidth;
  const offsetHeight = element.offsetHeight;
  const hasTransform = Math.round(rect.width) !== offsetWidth || Math.round(rect.height) !== offsetHeight;
  let x = hasTransform ? Math.round(rect.width) / offsetWidth : 1;
  let y = hasTransform ? Math.round(rect.height) / offsetHeight : 1;
  if (!x || !Number.isFinite(x)) x = 1;
  if (!y || !Number.isFinite(y)) y = 1;
  return { x, y };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getScale
});
