import { SliderProps, MarkerProps, ThumbProps } from './slider.types.mjs';
import '@zag-js/core';
import '@zag-js/types';

declare const props: (keyof SliderProps)[];
declare const splitProps: <Props extends Partial<SliderProps>>(props: Props) => [Partial<SliderProps>, Omit<Props, keyof SliderProps>];
declare const thumbProps: (keyof ThumbProps)[];
declare const splitThumbProps: <Props extends ThumbProps>(props: Props) => [ThumbProps, Omit<Props, keyof ThumbProps>];
declare const markerProps: "value"[];
declare const splitMarkerProps: <Props extends MarkerProps>(props: Props) => [MarkerProps, Omit<Props, "value">];

export { markerProps, props, splitMarkerProps, splitProps, splitThumbProps, thumbProps };
