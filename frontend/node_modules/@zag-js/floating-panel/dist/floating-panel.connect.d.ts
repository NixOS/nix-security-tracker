import { PropTypes, NormalizeProps } from '@zag-js/types';
import { FloatingPanelService, FloatingPanelApi } from './floating-panel.types.js';
import '@zag-js/core';
import '@zag-js/rect-utils';

declare function connect<T extends PropTypes>(service: FloatingPanelService, normalize: NormalizeProps<T>): FloatingPanelApi<T>;

export { connect };
