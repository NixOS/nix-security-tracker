import { AreaProps, ChannelProps, ColorPickerProps, SwatchProps, SwatchTriggerProps, TransparencyGridProps } from './color-picker.types.mjs';
import '@zag-js/color-utils';
import '@zag-js/core';
import '@zag-js/dismissable';
import '@zag-js/popper';
import '@zag-js/types';

declare const props: (keyof ColorPickerProps)[];
declare const splitProps: <Props extends Partial<ColorPickerProps>>(props: Props) => [Partial<ColorPickerProps>, Omit<Props, keyof ColorPickerProps>];
declare const areaProps: (keyof AreaProps)[];
declare const splitAreaProps: <Props extends AreaProps>(props: Props) => [AreaProps, Omit<Props, keyof AreaProps>];
declare const channelProps: (keyof ChannelProps)[];
declare const splitChannelProps: <Props extends ChannelProps>(props: Props) => [ChannelProps, Omit<Props, keyof ChannelProps>];
declare const swatchTriggerProps: (keyof SwatchTriggerProps)[];
declare const splitSwatchTriggerProps: <Props extends SwatchTriggerProps>(props: Props) => [SwatchTriggerProps, Omit<Props, keyof SwatchTriggerProps>];
declare const swatchProps: (keyof SwatchProps)[];
declare const splitSwatchProps: <Props extends SwatchProps>(props: Props) => [SwatchProps, Omit<Props, keyof SwatchProps>];
declare const transparencyGridProps: "size"[];
declare const splitTransparencyGridProps: <Props extends TransparencyGridProps>(props: Props) => [TransparencyGridProps, Omit<Props, "size">];

export { areaProps, channelProps, props, splitAreaProps, splitChannelProps, splitProps, splitSwatchProps, splitSwatchTriggerProps, splitTransparencyGridProps, swatchProps, swatchTriggerProps, transparencyGridProps };
