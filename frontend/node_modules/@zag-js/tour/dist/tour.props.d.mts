import { TourProps } from './tour.types.mjs';
import '@zag-js/core';
import '@zag-js/dismissable';
import '@zag-js/popper';
import '@zag-js/types';
import './utils/rect.mjs';

declare const props: (keyof TourProps)[];
declare const splitProps: <Props extends Partial<TourProps>>(props: Props) => [Partial<TourProps>, Omit<Props, keyof TourProps>];

export { props, splitProps };
