import { ItemProps, ToggleGroupProps } from './toggle-group.types.mjs';
import '@zag-js/core';
import '@zag-js/types';

declare const props: (keyof ToggleGroupProps)[];
declare const splitProps: <Props extends Partial<ToggleGroupProps>>(props: Props) => [Partial<ToggleGroupProps>, Omit<Props, keyof ToggleGroupProps>];
declare const itemProps: (keyof ItemProps)[];
declare const splitItemProps: <Props extends ItemProps>(props: Props) => [ItemProps, Omit<Props, keyof ItemProps>];

export { itemProps, props, splitItemProps, splitProps };
