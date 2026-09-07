import { Service } from '@zag-js/core';
import { PropTypes, NormalizeProps } from '@zag-js/types';
import { ToastSchema, ToastApi } from './toast.types.js';
import '@zag-js/dom-query';

declare function connect<T extends PropTypes, O>(service: Service<ToastSchema<O>>, normalize: NormalizeProps<T>): ToastApi<T, O>;

export { connect };
