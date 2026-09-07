import { ItemProps, TagsInputProps } from './tags-input.types.mjs';
import '@zag-js/core';
import '@zag-js/interact-outside';
import '@zag-js/live-region';
import '@zag-js/types';

declare const props: (keyof TagsInputProps)[];
declare const splitProps: <Props extends Partial<TagsInputProps>>(props: Props) => [Partial<TagsInputProps>, Omit<Props, keyof TagsInputProps>];
declare const itemProps: (keyof ItemProps)[];
declare const splitItemProps: <Props extends ItemProps>(props: Props) => [ItemProps, Omit<Props, keyof ItemProps>];

export { itemProps, props, splitItemProps, splitProps };
