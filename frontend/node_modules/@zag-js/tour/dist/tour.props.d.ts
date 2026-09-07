import { TourProps } from './tour.types.js';
import '@zag-js/core';
import '@zag-js/dismissable';
import '@zag-js/popper';
import '@zag-js/types';
import './utils/rect.js';

declare const props: (keyof TourProps)[];
declare const splitProps: <Props extends Partial<TourProps>>(props: Props) => [Partial<TourProps>, Omit<Props, keyof TourProps>];

export { props, splitProps };
