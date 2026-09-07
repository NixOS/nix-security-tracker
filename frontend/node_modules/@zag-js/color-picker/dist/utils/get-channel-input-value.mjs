// src/utils/get-channel-input-value.ts
import { parseColor } from "@zag-js/color-utils";
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
      const minColor = parseColor("#000000");
      const maxColor = parseColor("#FFFFFF");
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
export {
  getChannelRange,
  getChannelValue
};
