import { PropTypes, NormalizeProps } from '@zag-js/types';
import { QrCodeService, QrCodeApi } from './qr-code.types.mjs';
import '@zag-js/core';
import '@zag-js/dom-query';
import 'uqr';

declare function connect<T extends PropTypes>(service: QrCodeService, normalize: NormalizeProps<T>): QrCodeApi<T>;

export { connect };
