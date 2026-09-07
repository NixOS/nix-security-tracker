import { PropTypes, NormalizeProps } from '@zag-js/types';
import { NavigationMenuService, NavigationMenuApi } from './navigation-menu.types.js';
import '@zag-js/core';

declare function connect<T extends PropTypes>(service: NavigationMenuService, normalize: NormalizeProps<T>): NavigationMenuApi<T>;

export { connect };
