import { PropTypes, NormalizeProps } from '@zag-js/types';
import { NumberInputService, NumberInputApi } from './number-input.types.js';
import '@internationalized/number';
import '@zag-js/core';

declare function connect<T extends PropTypes>(service: NumberInputService, normalize: NormalizeProps<T>): NumberInputApi<T>;

export { connect };
