import { NumberInputProps } from './number-input.types.mjs';
import '@internationalized/number';
import '@zag-js/core';
import '@zag-js/types';

declare const props: (keyof NumberInputProps)[];
declare const splitProps: <Props extends Partial<NumberInputProps>>(props: Props) => [Partial<NumberInputProps>, Omit<Props, keyof NumberInputProps>];

export { props, splitProps };
