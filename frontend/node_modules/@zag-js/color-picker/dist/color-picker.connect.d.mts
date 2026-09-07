import { PropTypes, NormalizeProps } from '@zag-js/types';
import { ColorPickerService, ColorPickerApi } from './color-picker.types.mjs';
import '@zag-js/color-utils';
import '@zag-js/core';
import '@zag-js/dismissable';
import '@zag-js/popper';

declare function connect<T extends PropTypes>(service: ColorPickerService, normalize: NormalizeProps<T>): ColorPickerApi<T>;

export { connect };
