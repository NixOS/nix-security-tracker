import { PropTypes, NormalizeProps } from '@zag-js/types';
import { ToggleGroupService, ToggleGroupApi } from './toggle-group.types.mjs';
import '@zag-js/core';

declare function connect<T extends PropTypes>(service: ToggleGroupService, normalize: NormalizeProps<T>): ToggleGroupApi<T>;

export { connect };
