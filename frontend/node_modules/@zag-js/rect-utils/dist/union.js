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

// src/union.ts
var union_exports = {};
__export(union_exports, {
  union: () => union
});
module.exports = __toCommonJS(union_exports);
var import_from_points = require("./from-points.js");
var { min, max } = Math;
function union(...rs) {
  const pMin = {
    x: min(...rs.map((r) => r.minX)),
    y: min(...rs.map((r) => r.minY))
  };
  const pMax = {
    x: max(...rs.map((r) => r.maxX)),
    y: max(...rs.map((r) => r.maxY))
  };
  return (0, import_from_points.getRectFromPoints)(pMin, pMax);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  union
});
