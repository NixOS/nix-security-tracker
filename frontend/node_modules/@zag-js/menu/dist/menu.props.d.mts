import { ItemProps, OptionItemProps, MenuProps, ItemGroupLabelProps, ItemGroupProps } from './menu.types.mjs';
import '@zag-js/core';
import '@zag-js/dismissable';
import '@zag-js/dom-query';
import '@zag-js/popper';
import '@zag-js/rect-utils';
import '@zag-js/types';

declare const props: (keyof MenuProps)[];
declare const splitProps: <Props extends Partial<MenuProps>>(props: Props) => [Partial<MenuProps>, Omit<Props, keyof MenuProps>];
declare const itemProps: (keyof ItemProps)[];
declare const splitItemProps: <Props extends ItemProps>(props: Props) => [ItemProps, Omit<Props, keyof ItemProps>];
declare const itemGroupLabelProps: "htmlFor"[];
declare const splitItemGroupLabelProps: <Props extends ItemGroupLabelProps>(props: Props) => [ItemGroupLabelProps, Omit<Props, "htmlFor">];
declare const itemGroupProps: "id"[];
declare const splitItemGroupProps: <Props extends ItemGroupProps>(props: Props) => [ItemGroupProps, Omit<Props, "id">];
declare const optionItemProps: (keyof OptionItemProps)[];
declare const splitOptionItemProps: <Props extends OptionItemProps>(props: Props) => [OptionItemProps, Omit<Props, keyof OptionItemProps>];

export { itemGroupLabelProps, itemGroupProps, itemProps, optionItemProps, props, splitItemGroupLabelProps, splitItemGroupProps, splitItemProps, splitOptionItemProps, splitProps };
