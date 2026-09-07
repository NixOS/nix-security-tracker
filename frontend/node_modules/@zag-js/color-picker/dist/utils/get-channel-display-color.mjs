// src/utils/get-channel-display-color.ts
import { parseColor } from "@zag-js/color-utils";
function getChannelDisplayColor(color, channel) {
  switch (channel) {
    case "hue":
      return parseColor(`hsl(${color.getChannelValue("hue")}, 100%, 50%)`);
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
export {
  getChannelDisplayColor
};
