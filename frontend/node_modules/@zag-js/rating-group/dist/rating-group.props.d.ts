import { RatingGroupProps, ItemProps } from './rating-group.types.js';
import '@zag-js/core';
import '@zag-js/types';

declare const props: (keyof RatingGroupProps)[];
declare const splitProps: <Props extends Partial<RatingGroupProps>>(props: Props) => [Partial<RatingGroupProps>, Omit<Props, keyof RatingGroupProps>];
declare const itemProps: "index"[];
declare const splitItemProps: <Props extends ItemProps>(props: Props) => [ItemProps, Omit<Props, "index">];

export { itemProps, props, splitItemProps, splitProps };
