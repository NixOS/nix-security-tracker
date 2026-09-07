import "./chunk-QZ7TP4HQ.mjs";

// src/color.ts
import { clampValue, getPercentValue, getValuePercent, snapValueToStep } from "@zag-js/utils";
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
    return getValuePercent(value, minValue, maxValue);
  }
  getChannelPercentValue(channel, percentToCheck) {
    const { minValue, maxValue, step } = this.getChannelRange(channel);
    const percentValue = getPercentValue(percentToCheck, minValue, maxValue, step);
    return snapValueToStep(percentValue, minValue, maxValue, step);
  }
  withChannelValue(channel, value) {
    const { minValue, maxValue } = this.getChannelRange(channel);
    if (channel in this) {
      let clone = this.clone();
      clone[channel] = clampValue(value, minValue, maxValue);
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
    const value = snapValueToStep(
      clampValue(this.getChannelValue(channel) + stepSize, minValue, maxValue),
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
export {
  Color
};
