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

// src/duration.ts
var duration_exports = {};
__export(duration_exports, {
  getEndDate: () => getEndDate,
  getUnitDuration: () => getUnitDuration
});
module.exports = __toCommonJS(duration_exports);
function getUnitDuration(duration) {
  let clone = { ...duration };
  for (let key in clone) clone[key] = 1;
  return clone;
}
function getEndDate(startDate, duration) {
  let clone = { ...duration };
  if (clone.days) clone.days--;
  else clone.days = -1;
  return startDate.add(clone);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getEndDate,
  getUnitDuration
});
