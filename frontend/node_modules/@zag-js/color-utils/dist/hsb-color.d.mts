import { Color } from './color.mjs';
import { ColorStringFormat, ColorFormat, ColorType, ColorChannel, ColorChannelRange } from './types.mjs';

declare class HSBColor extends Color {
    private hue;
    private saturation;
    private brightness;
    private alpha;
    constructor(hue: number, saturation: number, brightness: number, alpha: number);
    static parse(value: string): HSBColor | void;
    toString(format?: ColorStringFormat): string;
    toFormat(format: ColorFormat): ColorType;
    /**
     * Converts a HSB color to HSL.
     * Conversion formula adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_HSL.
     * @returns An HSLColor object.
     */
    private toHSL;
    /**
     * Converts a HSV color value to RGB.
     * Conversion formula adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#HSV_to_RGB_alternative.
     * @returns An RGBColor object.
     */
    private toRGB;
    clone(): ColorType;
    getChannelFormatOptions(channel: ColorChannel): Intl.NumberFormatOptions;
    formatChannelValue(channel: ColorChannel, locale: string): string;
    getChannelRange(channel: ColorChannel): ColorChannelRange;
    toJSON(): Record<"h" | "s" | "b" | "a", number>;
    getFormat(): ColorFormat;
    private static colorChannels;
    getChannels(): [ColorChannel, ColorChannel, ColorChannel];
}

export { HSBColor };
