import { Color } from './color.js';
import { ColorStringFormat, ColorFormat, ColorType, ColorChannel, ColorChannelRange } from './types.js';

declare const HSL_REGEX: RegExp;
declare class HSLColor extends Color {
    private hue;
    private saturation;
    private lightness;
    private alpha;
    constructor(hue: number, saturation: number, lightness: number, alpha: number);
    static parse(value: string): HSLColor | void;
    toString(format?: ColorStringFormat): string;
    toFormat(format: ColorFormat): ColorType;
    /**
     * Converts a HSL color to HSB.
     * Conversion formula adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_HSV.
     * @returns An HSBColor object.
     */
    private toHSB;
    /**
     * Converts a HSL color to RGB.
     * Conversion formula adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_RGB_alternative.
     * @returns An RGBColor object.
     */
    private toRGB;
    clone(): ColorType;
    getChannelFormatOptions(channel: ColorChannel): Intl.NumberFormatOptions;
    formatChannelValue(channel: ColorChannel, locale: string): string;
    getChannelRange(channel: ColorChannel): ColorChannelRange;
    toJSON(): Record<"h" | "s" | "l" | "a", number>;
    getFormat(): ColorFormat;
    private static colorChannels;
    getChannels(): [ColorChannel, ColorChannel, ColorChannel];
}

export { HSLColor, HSL_REGEX };
