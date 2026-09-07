import { PropTypes, NormalizeProps } from '@zag-js/types';
import { DatePickerService, DatePickerApi } from './date-picker.types.js';
import '@internationalized/date';
import '@zag-js/core';
import '@zag-js/date-utils';
import '@zag-js/live-region';
import '@zag-js/popper';

declare function connect<T extends PropTypes>(service: DatePickerService, normalize: NormalizeProps<T>): DatePickerApi<T>;

export { connect };
