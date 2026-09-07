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

// src/utils/get-slider-background.ts
var get_slider_background_exports = {};
__export(get_slider_background_exports, {
  getSliderBackground: () => getSliderBackground
});
module.exports = __toCommonJS(get_slider_background_exports);
function getSliderBackgroundDirection(orientation, dir) {
  if (orientation === "vertical") {
    return "top";
  } else if (dir === "ltr") {
    return "right";
  } else {
    return "left";
  }
}
var getSliderBackground = (props) => {
  const { channel, value, dir, orientation } = props;
  const bgDirection = getSliderBackgroundDirection(orientation, dir);
  const { minValue, maxValue } = value.getChannelRange(channel);
  switch (channel) {
    case "hue":
      return `linear-gradient(to ${bgDirection}, rgb(255, 0, 0) 0%, rgb(255, 255, 0) 17%, rgb(0, 255, 0) 33%, rgb(0, 255, 255) 50%, rgb(0, 0, 255) 67%, rgb(255, 0, 255) 83%, rgb(255, 0, 0) 100%)`;
    case "lightness": {
      let start = value.withChannelValue(channel, minValue).toString("css");
      let middle = value.withChannelValue(channel, (maxValue - minValue) / 2).toString("css");
      let end = value.withChannelValue(channel, maxValue).toString("css");
      return `linear-gradient(to ${bgDirection}, ${start}, ${middle}, ${end})`;
    }
    case "saturation":
    case "brightness":
    case "red":
    case "green":
    case "blue":
    case "alpha": {
      let start = value.withChannelValue(channel, minValue).toString("css");
      let end = value.withChannelValue(channel, maxValue).toString("css");
      return `linear-gradient(to ${bgDirection}, ${start}, ${end})`;
    }
    default:
      throw new Error("Unknown color channel: " + channel);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getSliderBackground
});
