import { QrCodeProps } from './qr-code.types.mjs';
import '@zag-js/core';
import '@zag-js/dom-query';
import '@zag-js/types';
import 'uqr';

declare const props: (keyof QrCodeProps)[];
declare const splitProps: <Props extends Partial<QrCodeProps>>(props: Props) => [Partial<QrCodeProps>, Omit<Props, keyof QrCodeProps>];

export { props, splitProps };
