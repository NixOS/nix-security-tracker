import { DrawerStackApi } from '@zag-js/drawer';
import { PropTypes } from '@zag-js/react';
import { Provider } from 'react';
export interface UseDrawerStackContext extends DrawerStackApi<PropTypes> {
}
export declare const DrawerStackProvider: Provider<UseDrawerStackContext>, useDrawerStackContext: () => UseDrawerStackContext;
