import { ItemProps, RadioGroupProps } from './radio-group.types.js';
import '@zag-js/core';
import '@zag-js/types';

declare const props: (keyof RadioGroupProps)[];
declare const splitProps: <Props extends Partial<RadioGroupProps>>(props: Props) => [Partial<RadioGroupProps>, Omit<Props, keyof RadioGroupProps>];
declare const itemProps: (keyof ItemProps)[];
declare const splitItemProps: <Props extends ItemProps>(props: Props) => [ItemProps, Omit<Props, keyof ItemProps>];

export { itemProps, props, splitItemProps, splitProps };
