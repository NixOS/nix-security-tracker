import { PasswordInputProps } from './password-input.types.mjs';
import '@zag-js/core';
import '@zag-js/types';

declare const props: (keyof PasswordInputProps)[];
declare const splitProps: <Props extends Partial<PasswordInputProps>>(props: Props) => [Partial<PasswordInputProps>, Omit<Props, keyof PasswordInputProps>];

export { props, splitProps };
