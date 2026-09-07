import { PropTypes, NormalizeProps } from '@zag-js/types';
import { PasswordInputService, PasswordInputApi } from './password-input.types.js';
import '@zag-js/core';

declare function connect<T extends PropTypes>(service: PasswordInputService, normalize: NormalizeProps<T>): PasswordInputApi<T>;

export { connect };
