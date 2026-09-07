import { PropTypes, NormalizeProps } from '@zag-js/types';
import { ProgressService, ProgressApi } from './progress.types.js';
import '@zag-js/core';

declare function connect<T extends PropTypes>(service: ProgressService, normalize: NormalizeProps<T>): ProgressApi<T>;

export { connect };
