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

// src/angle.ts
var angle_exports = {};
__export(angle_exports, {
  getPointAngle: () => getPointAngle
});
module.exports = __toCommonJS(angle_exports);
function getPointAngle(rect, point, reference = rect.center) {
  const x = point.x - reference.x;
  const y = point.y - reference.y;
  const deg = Math.atan2(x, y) * (180 / Math.PI) + 180;
  return 360 - deg;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getPointAngle
});
