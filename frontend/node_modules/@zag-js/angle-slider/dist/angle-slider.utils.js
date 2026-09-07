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

// src/angle-slider.utils.ts
var angle_slider_utils_exports = {};
__export(angle_slider_utils_exports, {
  MAX_VALUE: () => MAX_VALUE,
  MIN_VALUE: () => MIN_VALUE,
  clampAngle: () => clampAngle,
  constrainAngle: () => constrainAngle,
  getAngle: () => getAngle,
  getDisplayAngle: () => getDisplayAngle,
  getPointerValue: () => getPointerValue,
  snapAngleToStep: () => snapAngleToStep
});
module.exports = __toCommonJS(angle_slider_utils_exports);
var import_rect_utils = require("@zag-js/rect-utils");
var import_utils = require("@zag-js/utils");
var MIN_VALUE = 0;
var MAX_VALUE = 359;
function mirrorAngle(angle) {
  return (360 - angle) % 360;
}
function getAngle(controlEl, point, angularOffset, dir) {
  const rect = (0, import_rect_utils.createRect)(controlEl.getBoundingClientRect());
  let angle = (0, import_rect_utils.getPointAngle)(rect, point);
  if (angularOffset != null) {
    return angle - angularOffset;
  }
  if (dir === "rtl") {
    angle = mirrorAngle(angle);
  }
  return angle;
}
function getPointerValue(controlEl, point, angularOffset, value, dir) {
  if (angularOffset == null) {
    return getAngle(controlEl, point, null, dir);
  }
  const angle = getAngle(controlEl, point);
  const clickAngle = value + angularOffset;
  return dir === "rtl" ? value + clickAngle - angle : angle - angularOffset;
}
function getDisplayAngle(value, dir) {
  return dir === "rtl" ? mirrorAngle(value) : value;
}
function clampAngle(degree) {
  return Math.min(Math.max(degree, MIN_VALUE), MAX_VALUE);
}
function constrainAngle(degree, step) {
  const clampedDegree = clampAngle(degree);
  const upperStep = Math.ceil(clampedDegree / step);
  const nearestStep = Math.round(clampedDegree / step);
  return upperStep >= clampedDegree / step ? upperStep * step === MAX_VALUE ? MIN_VALUE : upperStep * step : nearestStep * step;
}
function snapAngleToStep(value, step) {
  return (0, import_utils.snapValueToStep)(value, MIN_VALUE, MAX_VALUE, step);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  MAX_VALUE,
  MIN_VALUE,
  clampAngle,
  constrainAngle,
  getAngle,
  getDisplayAngle,
  getPointerValue,
  snapAngleToStep
});
