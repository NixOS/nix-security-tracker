import { PropTypes, NormalizeProps } from '@zag-js/types';
import { ScrollAreaService, ScrollAreaApi } from './scroll-area.types.mjs';
import '@zag-js/core';
import './utils/timeout.mjs';

declare function connect<T extends PropTypes>(service: ScrollAreaService, normalize: NormalizeProps<T>): ScrollAreaApi<T>;

export { connect };
