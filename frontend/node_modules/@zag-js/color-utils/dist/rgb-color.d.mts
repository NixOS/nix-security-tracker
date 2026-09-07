import { Color } from './color.mjs';
import { ColorStringFormat, ColorFormat, ColorType, ColorChannel, ColorChannelRange } from './types.mjs';

declare class RGBColor extends Color {
    private red;
    private green;
    private blue;
    private alpha;
    constructor(red: number, green: number, blue: number, alpha: number);
    static parse(value: string): RGBColor | undefined;
    toString(format?: ColorStringFormat): string;
    toFormat(format: ColorFormat): ColorType;
    toHexInt(): number;
    /**
     * Converts an RGB color value to HSB.
     * Conversion formula adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#From_RGB.
     * @returns An HSBColor object.
     */
    private toHSB;
    /**
     * Converts an RGB color value to HSL.
     * Conversion formula adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#From_RGB.
     * @returns An HSLColor object.
     */
    private toHSL;
    clone(): ColorType;
    getChannelFormatOptions(channel: ColorChannel): Intl.NumberFormatOptions;
    formatChannelValue(channel: ColorChannel, locale: string): string;
    getChannelRange(channel: ColorChannel): ColorChannelRange;
    toJSON(): Record<"r" | "g" | "b" | "a", number>;
    getFormat(): ColorFormat;
    private static colorChannels;
    getChannels(): [ColorChannel, ColorChannel, ColorChannel];
}

export { RGBColor };
