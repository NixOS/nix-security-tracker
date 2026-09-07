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

// src/utils/clip-path.ts
var clip_path_exports = {};
__export(clip_path_exports, {
  getClipPath: () => getClipPath
});
module.exports = __toCommonJS(clip_path_exports);
function getClipPath(options) {
  const {
    radius = 0,
    rootSize: { width: w, height: h },
    rect: { width, height, x, y },
    enabled = true
  } = options;
  if (!enabled) return "";
  const {
    topLeft = 0,
    topRight = 0,
    bottomRight = 0,
    bottomLeft = 0
  } = typeof radius === "number" ? { topLeft: radius, topRight: radius, bottomRight: radius, bottomLeft: radius } : radius;
  return `M${w},${h}  H0  V0  H${w}  V${h}  Z  M${x + topLeft},${y}  a${topLeft},${topLeft},0,0,0-${topLeft},${topLeft}  V${height + y - bottomLeft}  a${bottomLeft},${bottomLeft},0,0,0,${bottomLeft},${bottomLeft}  H${width + x - bottomRight}  a${bottomRight},${bottomRight},0,0,0,${bottomRight}-${bottomRight}  V${y + topRight}  a${topRight},${topRight},0,0,0-${topRight}-${topRight}  Z`;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getClipPath
});
