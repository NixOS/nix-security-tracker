import { PropTypes, NormalizeProps } from '@zag-js/types';
import { StepsService, StepsApi } from './steps.types.mjs';
import '@zag-js/core';

declare function connect<T extends PropTypes>(service: StepsService, normalize: NormalizeProps<T>): StepsApi<T>;

export { connect };
