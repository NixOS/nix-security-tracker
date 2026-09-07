import { PropTypes, NormalizeProps } from '@zag-js/types';
import { SliderService, SliderApi } from './slider.types.js';
import '@zag-js/core';

declare function connect<T extends PropTypes>(service: SliderService, normalize: NormalizeProps<T>): SliderApi<T>;

export { connect };
