import { Service } from '@zag-js/core';
import { PropTypes, NormalizeProps } from '@zag-js/types';
import { ToastGroupSchema, ToastGroupApi } from './toast.types.js';
import '@zag-js/dom-query';

declare function groupConnect<T extends PropTypes, O = any>(service: Service<ToastGroupSchema>, normalize: NormalizeProps<T>): ToastGroupApi<T, O>;

export { groupConnect };
