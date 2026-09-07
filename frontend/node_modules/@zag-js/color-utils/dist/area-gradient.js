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

// src/area-gradient.ts
var area_gradient_exports = {};
__export(area_gradient_exports, {
  getColorAreaGradient: () => getColorAreaGradient
});
module.exports = __toCommonJS(area_gradient_exports);
var import_color_format_gradient = require("./color-format-gradient.js");
function getColorAreaGradient(color, options) {
  const { xChannel, yChannel, dir: dirProp = "ltr" } = options;
  const { zChannel } = color.getColorAxes({ xChannel, yChannel });
  const zValue = color.getChannelValue(zChannel);
  const { minValue: zMin, maxValue: zMax } = color.getChannelRange(zChannel);
  const orientation = ["top", dirProp === "rtl" ? "left" : "right"];
  let dir = false;
  let background = { areaStyles: {}, areaGradientStyles: {} };
  let alphaValue = (zValue - zMin) / (zMax - zMin);
  let isHSL = color.getFormat() === "hsla";
  switch (zChannel) {
    case "red": {
      dir = xChannel === "green";
      background = (0, import_color_format_gradient.generateRGB_R)(orientation, dir, zValue);
      break;
    }
    case "green": {
      dir = xChannel === "red";
      background = (0, import_color_format_gradient.generateRGB_G)(orientation, dir, zValue);
      break;
    }
    case "blue": {
      dir = xChannel === "red";
      background = (0, import_color_format_gradient.generateRGB_B)(orientation, dir, zValue);
      break;
    }
    case "hue": {
      dir = xChannel !== "saturation";
      if (isHSL) {
        background = (0, import_color_format_gradient.generateHSL_H)(orientation, dir, zValue);
      } else {
        background = (0, import_color_format_gradient.generateHSB_H)(orientation, dir, zValue);
      }
      break;
    }
    case "saturation": {
      dir = xChannel === "hue";
      if (isHSL) {
        background = (0, import_color_format_gradient.generateHSL_S)(orientation, dir, alphaValue);
      } else {
        background = (0, import_color_format_gradient.generateHSB_S)(orientation, dir, alphaValue);
      }
      break;
    }
    case "brightness": {
      dir = xChannel === "hue";
      background = (0, import_color_format_gradient.generateHSB_B)(orientation, dir, alphaValue);
      break;
    }
    case "lightness": {
      dir = xChannel === "hue";
      background = (0, import_color_format_gradient.generateHSL_L)(orientation, dir, zValue);
      break;
    }
  }
  return background;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getColorAreaGradient
});
