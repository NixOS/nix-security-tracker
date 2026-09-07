import { ToggleProps } from './toggle.types.mjs';
import '@zag-js/core';
import '@zag-js/types';

declare const props: (keyof ToggleProps)[];
declare const splitProps: <Props extends Partial<ToggleProps>>(props: Props) => [Partial<ToggleProps>, Omit<Props, keyof ToggleProps>];

export { props, splitProps };
