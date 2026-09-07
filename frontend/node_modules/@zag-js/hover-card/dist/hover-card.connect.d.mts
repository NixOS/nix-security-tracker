import { PropTypes, NormalizeProps } from '@zag-js/types';
import { HoverCardService, HoverCardApi } from './hover-card.types.mjs';
import '@zag-js/core';
import '@zag-js/dismissable';
import '@zag-js/popper';

declare function connect<T extends PropTypes>(service: HoverCardService, normalize: NormalizeProps<T>): HoverCardApi<T>;

export { connect };
