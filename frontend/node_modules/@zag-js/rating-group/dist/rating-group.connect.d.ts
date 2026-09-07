import { PropTypes, NormalizeProps } from '@zag-js/types';
import { RatingGroupService, RatingGroupApi } from './rating-group.types.js';
import '@zag-js/core';

declare function connect<T extends PropTypes>(service: RatingGroupService, normalize: NormalizeProps<T>): RatingGroupApi<T>;

export { connect };
