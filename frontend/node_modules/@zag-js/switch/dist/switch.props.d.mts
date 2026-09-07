import { SwitchProps } from './switch.types.mjs';
import '@zag-js/core';
import '@zag-js/types';

declare const props: (keyof SwitchProps)[];
declare const splitProps: <Props extends Partial<SwitchProps>>(props: Props) => [Partial<SwitchProps>, Omit<Props, keyof SwitchProps>];

export { props, splitProps };
