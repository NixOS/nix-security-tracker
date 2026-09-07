import { AngleSliderProps } from './angle-slider.types.js';
import '@zag-js/types';
import '@zag-js/core';

declare const props: (keyof AngleSliderProps)[];
declare const splitProps: <Props extends Partial<AngleSliderProps>>(props: Props) => [Partial<AngleSliderProps>, Omit<Props, keyof AngleSliderProps>];

export { props, splitProps };
