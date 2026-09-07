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

// src/placement.ts
var placement_exports = {};
__export(placement_exports, {
  getPlacementDetails: () => getPlacementDetails,
  getPlacementSide: () => getPlacementSide,
  isValidPlacement: () => isValidPlacement
});
module.exports = __toCommonJS(placement_exports);
function isValidPlacement(v) {
  return /^(?:top|bottom|left|right)(?:-(?:start|end))?$/.test(v);
}
function getPlacementDetails(placement) {
  const [side, align] = placement.split("-");
  return { side, align, hasAlign: align != null };
}
function getPlacementSide(placement) {
  return placement.split("-")[0];
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getPlacementDetails,
  getPlacementSide,
  isValidPlacement
});
