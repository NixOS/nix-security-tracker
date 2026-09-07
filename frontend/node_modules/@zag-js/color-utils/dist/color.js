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

// src/color.ts
var color_exports = {};
__export(color_exports, {
  Color: () => Color
});
module.exports = __toCommonJS(color_exports);
var import_utils = require("@zag-js/utils");
var isEqualObject = (a, b) => {
  if (Object.keys(a).length !== Object.keys(b).length) return false;
  for (let key in a) if (a[key] !== b[key]) return false;
  return true;
};
var Color = class {
  toHexInt() {
    return this.toFormat("rgba").toHexInt();
  }
  getChannelValue(channel) {
    if (channel in this) return this[channel];
    throw new Error("Unsupported color channel: " + channel);
  }
  getChannelValuePercent(channel, valueToCheck) {
    const value = valueToCheck ?? this.getChannelValue(channel);
    const { minValue, maxValue } = this.getChannelRange(channel);
    return (0, import_utils.getValuePercent)(value, minValue, maxValue);
  }
  getChannelPercentValue(channel, percentToCheck) {
    const { minValue, maxValue, step } = this.getChannelRange(channel);
    const percentValue = (0, import_utils.getPercentValue)(percentToCheck, minValue, maxValue, step);
    return (0, import_utils.snapValueToStep)(percentValue, minValue, maxValue, step);
  }
  withChannelValue(channel, value) {
    const { minValue, maxValue } = this.getChannelRange(channel);
    if (channel in this) {
      let clone = this.clone();
      clone[channel] = (0, import_utils.clampValue)(value, minValue, maxValue);
      return clone;
    }
    throw new Error("Unsupported color channel: " + channel);
  }
  getColorAxes(xyChannels) {
    let { xChannel, yChannel } = xyChannels;
    let xCh = xChannel || this.getChannels().find((c) => c !== yChannel);
    let yCh = yChannel || this.getChannels().find((c) => c !== xCh);
    let zCh = this.getChannels().find((c) => c !== xCh && c !== yCh);
    return { xChannel: xCh, yChannel: yCh, zChannel: zCh };
  }
  incrementChannel(channel, stepSize) {
    const { minValue, maxValue, step } = this.getChannelRange(channel);
    const value = (0, import_utils.snapValueToStep)(
      (0, import_utils.clampValue)(this.getChannelValue(channel) + stepSize, minValue, maxValue),
      minValue,
      maxValue,
      step
    );
    return this.withChannelValue(channel, value);
  }
  decrementChannel(channel, stepSize) {
    return this.incrementChannel(channel, -stepSize);
  }
  isEqual(color) {
    const isSame = isEqualObject(this.toJSON(), color.toJSON());
    return isSame && this.getChannelValue("alpha") === color.getChannelValue("alpha");
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Color
});
