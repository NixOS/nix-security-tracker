import { ItemProps, AccordionProps } from './accordion.types.mjs';
import '@zag-js/types';
import '@zag-js/core';

declare const props: (keyof AccordionProps)[];
declare const splitProps: <Props extends Partial<AccordionProps>>(props: Props) => [Partial<AccordionProps>, Omit<Props, keyof AccordionProps>];
declare const itemProps: (keyof ItemProps)[];
declare const splitItemProps: <Props extends ItemProps>(props: Props) => [ItemProps, Omit<Props, keyof ItemProps>];

export { itemProps, props, splitItemProps, splitProps };
