import { ItemProps, SelectProps, ItemGroupLabelProps, ItemGroupProps } from './select.types.js';
import '@zag-js/collection';
import '@zag-js/core';
import '@zag-js/dismissable';
import '@zag-js/dom-query';
import '@zag-js/popper';
import '@zag-js/types';

declare const props: (keyof SelectProps<any>)[];
declare const splitProps: <Props extends Partial<SelectProps<any>>>(props: Props) => [Partial<SelectProps<any>>, Omit<Props, keyof SelectProps<any>>];
declare const itemProps: (keyof ItemProps<any>)[];
declare const splitItemProps: <Props extends ItemProps<any>>(props: Props) => [ItemProps<any>, Omit<Props, keyof ItemProps<any>>];
declare const itemGroupProps: "id"[];
declare const splitItemGroupProps: <Props extends ItemGroupProps>(props: Props) => [ItemGroupProps, Omit<Props, "id">];
declare const itemGroupLabelProps: "htmlFor"[];
declare const splitItemGroupLabelProps: <Props extends ItemGroupLabelProps>(props: Props) => [ItemGroupLabelProps, Omit<Props, "htmlFor">];

export { itemGroupLabelProps, itemGroupProps, itemProps, props, splitItemGroupLabelProps, splitItemGroupProps, splitItemProps, splitProps };
