import { PinInputProps } from './pin-input.types.mjs';
import '@zag-js/core';
import '@zag-js/types';

declare const props: (keyof PinInputProps)[];
declare const splitProps: <Props extends Partial<PinInputProps>>(props: Props) => [Partial<PinInputProps>, Omit<Props, keyof PinInputProps>];

export { props, splitProps };
