import { Service } from '@zag-js/core';
import { PropTypes, NormalizeProps } from '@zag-js/types';
import { MenuSchema, MenuApi } from './menu.types.js';
import '@zag-js/dismissable';
import '@zag-js/dom-query';
import '@zag-js/popper';
import '@zag-js/rect-utils';

declare function connect<T extends PropTypes>(service: Service<MenuSchema>, normalize: NormalizeProps<T>): MenuApi<T>;

export { connect };
