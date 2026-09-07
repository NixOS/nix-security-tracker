import { PropTypes, NormalizeProps } from '@zag-js/types';
import { ClipboardService, ClipboardApi } from './clipboard.types.mjs';
import '@zag-js/core';

declare function connect<T extends PropTypes>(service: ClipboardService, normalize: NormalizeProps<T>): ClipboardApi<T>;

export { connect };
