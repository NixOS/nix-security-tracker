import { PropTypes, NormalizeProps } from '@zag-js/types';
import { Service } from '@zag-js/core';
import { CheckboxSchema, CheckboxApi } from './checkbox.types.mjs';

declare function connect<T extends PropTypes>(service: Service<CheckboxSchema>, normalize: NormalizeProps<T>): CheckboxApi<T>;

export { connect };
