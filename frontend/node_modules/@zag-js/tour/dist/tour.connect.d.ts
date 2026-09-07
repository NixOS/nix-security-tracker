import { PropTypes, NormalizeProps } from '@zag-js/types';
import { TourService, TourApi } from './tour.types.js';
import '@zag-js/core';
import '@zag-js/dismissable';
import '@zag-js/popper';
import './utils/rect.js';

declare function connect<T extends PropTypes>(service: TourService, normalize: NormalizeProps<T>): TourApi<T>;

export { connect };
