import { PropTypes, NormalizeProps } from '@zag-js/types';
import { CarouselService, CarouselApi } from './carousel.types.js';
import '@zag-js/core';

declare function connect<T extends PropTypes>(service: CarouselService, normalize: NormalizeProps<T>): CarouselApi<T>;

export { connect };
