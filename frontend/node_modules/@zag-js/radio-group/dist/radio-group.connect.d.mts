import { PropTypes, NormalizeProps } from '@zag-js/types';
import { RadioGroupService, RadioGroupApi } from './radio-group.types.mjs';
import '@zag-js/core';

declare function connect<T extends PropTypes>(service: RadioGroupService, normalize: NormalizeProps<T>): RadioGroupApi<T>;

export { connect };
