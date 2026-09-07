import { PropTypes, NormalizeProps } from '@zag-js/types';
import { PaginationService, PaginationApi } from './pagination.types.js';
import '@zag-js/core';

declare function connect<T extends PropTypes>(service: PaginationService, normalize: NormalizeProps<T>): PaginationApi<T>;

export { connect };
