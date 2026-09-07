import { PropTypes, NormalizeProps } from '@zag-js/types';
import { PopoverService, PopoverApi } from './popover.types.js';
import '@zag-js/core';
import '@zag-js/dismissable';
import '@zag-js/popper';

declare function connect<T extends PropTypes>(service: PopoverService, normalize: NormalizeProps<T>): PopoverApi<T>;

export { connect };
