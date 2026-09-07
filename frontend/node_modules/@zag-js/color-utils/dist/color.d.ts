import { ColorType, ColorFormat, ColorStringFormat, ColorChannel, ColorChannelRange, Color2DAxes, ColorAxes } from './types.js';

declare abstract class Color implements ColorType {
    abstract toFormat(format: ColorFormat): ColorType;
    abstract toJSON(): Record<string, number>;
    abstract toString(format?: ColorStringFormat): string;
    abstract clone(): ColorType;
    abstract getChannelRange(channel: ColorChannel): ColorChannelRange;
    abstract getFormat(): ColorFormat;
    abstract getChannels(): [ColorChannel, ColorChannel, ColorChannel];
    abstract formatChannelValue(channel: ColorChannel, locale: string): string;
    toHexInt(): number;
    getChannelValue(channel: ColorChannel): number;
    getChannelValuePercent(channel: ColorChannel, valueToCheck?: number): number;
    getChannelPercentValue(channel: ColorChannel, percentToCheck: number): number;
    withChannelValue(channel: ColorChannel, value: number): ColorType;
    getColorAxes(xyChannels: Color2DAxes): ColorAxes;
    incrementChannel(channel: ColorChannel, stepSize: number): ColorType;
    decrementChannel(channel: ColorChannel, stepSize: number): ColorType;
    isEqual(color: ColorType): boolean;
}

export { Color };
