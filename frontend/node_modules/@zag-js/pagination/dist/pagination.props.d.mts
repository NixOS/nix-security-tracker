import { ItemProps, PaginationProps, EllipsisProps } from './pagination.types.mjs';
import '@zag-js/core';
import '@zag-js/types';

declare const props: (keyof PaginationProps)[];
declare const splitProps: <Props extends Partial<PaginationProps>>(props: Props) => [Partial<PaginationProps>, Omit<Props, keyof PaginationProps>];
declare const itemProps: (keyof ItemProps)[];
declare const splitItemProps: <Props extends ItemProps>(props: Props) => [ItemProps, Omit<Props, keyof ItemProps>];
declare const ellipsisProps: "index"[];
declare const splitEllipsisProps: <Props extends EllipsisProps>(props: Props) => [EllipsisProps, Omit<Props, "index">];

export { ellipsisProps, itemProps, props, splitEllipsisProps, splitItemProps, splitProps };
