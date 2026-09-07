import { PropTypes, NormalizeProps } from '@zag-js/types';
import { SignaturePadService, SignaturePadApi } from './signature-pad.types.js';
import '@zag-js/core';
import 'perfect-freehand';

declare function connect<T extends PropTypes>(service: SignaturePadService, normalize: NormalizeProps<T>): SignaturePadApi<T>;

export { connect };
