import { PropTypes, NormalizeProps } from '@zag-js/types';
import { ScrollAreaService, ScrollAreaApi } from './scroll-area.types.js';
import '@zag-js/core';
import './utils/timeout.js';

declare function connect<T extends PropTypes>(service: ScrollAreaService, normalize: NormalizeProps<T>): ScrollAreaApi<T>;

export { connect };
