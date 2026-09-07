import { Color } from './color.js';
import { ColorChannel } from './types.js';

interface GradientOptions {
    xChannel: ColorChannel;
    yChannel: ColorChannel;
    dir?: "rtl" | "ltr" | undefined;
}
interface GradientStyles {
    areaStyles: Record<string, string>;
    areaGradientStyles: Record<string, string>;
}
declare function getColorAreaGradient(color: Color, options: GradientOptions): GradientStyles;

export { getColorAreaGradient };
