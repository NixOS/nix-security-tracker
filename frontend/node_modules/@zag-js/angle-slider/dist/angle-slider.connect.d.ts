import { PropTypes, NormalizeProps } from '@zag-js/types';
import { AngleSliderService, AngleSliderApi } from './angle-slider.types.js';
import '@zag-js/core';

declare function connect<T extends PropTypes>(service: AngleSliderService, normalize: NormalizeProps<T>): AngleSliderApi<T>;

export { connect };
