import { ChannelProps, ColorPickerProps } from '../color-picker.types.mjs';
import { Color } from '@zag-js/color-utils';
import '@zag-js/core';
import '@zag-js/dismissable';
import '@zag-js/popper';
import '@zag-js/types';

interface SliderBackgroundProps extends Required<ChannelProps> {
    value: Color;
    dir: ColorPickerProps["dir"];
}
declare const getSliderBackground: (props: SliderBackgroundProps) => string;

export { getSliderBackground };
