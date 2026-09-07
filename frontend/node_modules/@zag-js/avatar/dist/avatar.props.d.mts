import { AvatarProps } from './avatar.types.mjs';
import '@zag-js/core';
import '@zag-js/types';

declare const props: (keyof AvatarProps)[];
declare const splitProps: <Props extends Partial<AvatarProps>>(props: Props) => [Partial<AvatarProps>, Omit<Props, keyof AvatarProps>];

export { props, splitProps };
