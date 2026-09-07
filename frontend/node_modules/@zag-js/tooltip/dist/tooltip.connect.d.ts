import { Service } from '@zag-js/core';
import { PropTypes, NormalizeProps } from '@zag-js/types';
import { TooltipSchema, TooltipApi } from './tooltip.types.js';
import '@zag-js/popper';

declare function connect<P extends PropTypes>(service: Service<TooltipSchema>, normalize: NormalizeProps<P>): TooltipApi<P>;

export { connect };
