import { Service } from '@zag-js/core';
import { PropTypes, NormalizeProps } from '@zag-js/types';
import { TimerSchema, TimerApi } from './timer.types.mjs';

declare function connect<T extends PropTypes>(service: Service<TimerSchema>, normalize: NormalizeProps<T>): TimerApi<T>;

export { connect };
