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

// src/utils/get-channel-input-value.ts
var get_channel_input_value_exports = {};
__export(get_channel_input_value_exports, {
  getChannelRange: () => getChannelRange,
  getChannelValue: () => getChannelValue
});
module.exports = __toCommonJS(get_channel_input_value_exports);
var import_color_utils = require("@zag-js/color-utils");
function getChannelValue(color, channel) {
  if (channel == null) return "";
  if (channel === "hex") {
    return color.toString("hex");
  }
  if (channel === "css") {
    return color.toString("css");
  }
  if (channel in color) {
    return color.getChannelValue(channel).toString();
  }
  const isHSL = color.getFormat() === "hsla";
  switch (channel) {
    case "hue":
      return isHSL ? color.toFormat("hsla").getChannelValue("hue").toString() : color.toFormat("hsba").getChannelValue("hue").toString();
    case "saturation":
      return isHSL ? color.toFormat("hsla").getChannelValue("saturation").toString() : color.toFormat("hsba").getChannelValue("saturation").toString();
    case "lightness":
      return color.toFormat("hsla").getChannelValue("lightness").toString();
    case "brightness":
      return color.toFormat("hsba").getChannelValue("brightness").toString();
    case "red":
    case "green":
    case "blue":
      return color.toFormat("rgba").getChannelValue(channel).toString();
    default:
      return color.getChannelValue(channel).toString();
  }
}
function getChannelRange(color, channel) {
  switch (channel) {
    case "hex":
      const minColor = (0, import_color_utils.parseColor)("#000000");
      const maxColor = (0, import_color_utils.parseColor)("#FFFFFF");
      return {
        minValue: minColor.toHexInt(),
        maxValue: maxColor.toHexInt(),
        pageSize: 10,
        step: 1
      };
    case "css":
      return void 0;
    case "hue":
    case "saturation":
    case "lightness":
      return color.toFormat("hsla").getChannelRange(channel);
    case "brightness":
      return color.toFormat("hsba").getChannelRange(channel);
    case "red":
    case "green":
    case "blue":
      return color.toFormat("rgba").getChannelRange(channel);
    default:
      return color.getChannelRange(channel);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getChannelRange,
  getChannelValue
});
