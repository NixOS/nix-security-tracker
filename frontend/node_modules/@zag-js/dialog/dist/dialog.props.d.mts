import { DialogProps } from './dialog.types.mjs';
import '@zag-js/core';
import '@zag-js/dismissable';
import '@zag-js/types';

declare const props: (keyof DialogProps)[];
declare const splitProps: <Props extends Partial<DialogProps>>(props: Props) => [Partial<DialogProps>, Omit<Props, keyof DialogProps>];

export { props, splitProps };
