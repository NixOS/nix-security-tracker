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

// src/utils/get-channel-display-color.ts
var get_channel_display_color_exports = {};
__export(get_channel_display_color_exports, {
  getChannelDisplayColor: () => getChannelDisplayColor
});
module.exports = __toCommonJS(get_channel_display_color_exports);
var import_color_utils = require("@zag-js/color-utils");
function getChannelDisplayColor(color, channel) {
  switch (channel) {
    case "hue":
      return (0, import_color_utils.parseColor)(`hsl(${color.getChannelValue("hue")}, 100%, 50%)`);
    case "lightness":
    case "brightness":
    case "saturation":
    case "red":
    case "green":
    case "blue":
      return color.withChannelValue("alpha", 1);
    case "alpha": {
      return color;
    }
    default:
      throw new Error("Unknown color channel: " + channel);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getChannelDisplayColor
});
