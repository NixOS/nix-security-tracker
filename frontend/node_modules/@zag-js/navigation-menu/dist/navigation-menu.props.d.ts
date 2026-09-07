import { NavigationMenuProps } from './navigation-menu.types.js';
import '@zag-js/core';
import '@zag-js/types';

declare const props: (keyof NavigationMenuProps)[];
declare const splitProps: <Props extends Partial<NavigationMenuProps>>(props: Props) => [Partial<NavigationMenuProps>, Omit<Props, keyof NavigationMenuProps>];

export { props, splitProps };
