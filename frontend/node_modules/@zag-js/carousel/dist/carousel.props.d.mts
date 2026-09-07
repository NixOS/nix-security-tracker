import { IndicatorProps, ItemProps, CarouselProps } from './carousel.types.mjs';
import '@zag-js/core';
import '@zag-js/types';

declare const props: (keyof CarouselProps)[];
declare const splitProps: <Props extends Partial<CarouselProps>>(props: Props) => [Partial<CarouselProps>, Omit<Props, keyof CarouselProps>];
declare const indicatorProps: (keyof IndicatorProps)[];
declare const splitIndicatorProps: <Props extends IndicatorProps>(props: Props) => [IndicatorProps, Omit<Props, keyof IndicatorProps>];
declare const itemProps: (keyof ItemProps)[];
declare const splitItemProps: <Props extends ItemProps>(props: Props) => [ItemProps, Omit<Props, keyof ItemProps>];

export { indicatorProps, itemProps, props, splitIndicatorProps, splitItemProps, splitProps };
