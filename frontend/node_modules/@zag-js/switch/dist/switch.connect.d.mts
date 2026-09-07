import { PropTypes, NormalizeProps } from '@zag-js/types';
import { SwitchService, SwitchApi } from './switch.types.mjs';
import '@zag-js/core';

declare function connect<T extends PropTypes>(service: SwitchService, normalize: NormalizeProps<T>): SwitchApi<T>;

export { connect };
