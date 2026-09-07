import { PropTypes, NormalizeProps } from '@zag-js/types';
import { MarqueeService, MarqueeApi } from './marquee.types.js';
import '@zag-js/core';

declare function connect<T extends PropTypes>(service: MarqueeService, normalize: NormalizeProps<T>): MarqueeApi<T>;

export { connect };
