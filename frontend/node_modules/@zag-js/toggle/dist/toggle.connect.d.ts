import { PropTypes, NormalizeProps } from '@zag-js/types';
import { ToggleService, ToggleApi } from './toggle.types.js';
import '@zag-js/core';

declare function connect<T extends PropTypes>(service: ToggleService, normalize: NormalizeProps<T>): ToggleApi<T>;

export { connect };
