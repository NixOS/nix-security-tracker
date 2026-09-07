// src/angle-slider.utils.ts
import { createRect, getPointAngle } from "@zag-js/rect-utils";
import { snapValueToStep } from "@zag-js/utils";
var MIN_VALUE = 0;
var MAX_VALUE = 359;
function mirrorAngle(angle) {
  return (360 - angle) % 360;
}
function getAngle(controlEl, point, angularOffset, dir) {
  const rect = createRect(controlEl.getBoundingClientRect());
  let angle = getPointAngle(rect, point);
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
  return snapValueToStep(value, MIN_VALUE, MAX_VALUE, step);
}
export {
  MAX_VALUE,
  MIN_VALUE,
  clampAngle,
  constrainAngle,
  getAngle,
  getDisplayAngle,
  getPointerValue,
  snapAngleToStep
};
