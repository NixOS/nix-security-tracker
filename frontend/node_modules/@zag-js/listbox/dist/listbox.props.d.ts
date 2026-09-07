import { ItemProps, ListboxProps, ItemGroupLabelProps, ItemGroupProps } from './listbox.types.js';
import '@zag-js/collection';
import '@zag-js/core';
import '@zag-js/dom-query';
import '@zag-js/types';

declare const props: (keyof ListboxProps<any>)[];
declare const splitProps: <Props extends ListboxProps<any>>(props: Props) => [ListboxProps<any>, Omit<Props, keyof ListboxProps<any>>];
declare const itemProps: (keyof ItemProps<any>)[];
declare const splitItemProps: <Props extends ItemProps<any>>(props: Props) => [ItemProps<any>, Omit<Props, keyof ItemProps<any>>];
declare const itemGroupProps: "id"[];
declare const splitItemGroupProps: <Props extends ItemGroupProps>(props: Props) => [ItemGroupProps, Omit<Props, "id">];
declare const itemGroupLabelProps: "htmlFor"[];
declare const splitItemGroupLabelProps: <Props extends ItemGroupLabelProps>(props: Props) => [ItemGroupLabelProps, Omit<Props, "htmlFor">];

export { itemGroupLabelProps, itemGroupProps, itemProps, props, splitItemGroupLabelProps, splitItemGroupProps, splitItemProps, splitProps };
