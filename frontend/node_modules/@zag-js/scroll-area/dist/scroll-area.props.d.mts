import { ScrollAreaProps } from './scroll-area.types.mjs';
import '@zag-js/core';
import '@zag-js/types';
import './utils/timeout.mjs';

declare const props: (keyof ScrollAreaProps)[];
declare const splitProps: <Props extends Partial<ScrollAreaProps>>(props: Props) => [Partial<ScrollAreaProps>, Omit<Props, keyof ScrollAreaProps>];

export { props, splitProps };
