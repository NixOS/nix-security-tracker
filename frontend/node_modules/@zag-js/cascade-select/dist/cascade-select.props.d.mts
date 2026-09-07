import { CascadeSelectProps } from './cascade-select.types.mjs';
import '@zag-js/popper';
import '@zag-js/collection';
import '@zag-js/rect-utils';
import '@zag-js/types';
import '@zag-js/core';
import '@zag-js/dismissable';

declare const props: (keyof CascadeSelectProps<any>)[];
declare const splitProps: <Props extends Partial<CascadeSelectProps<any>>>(props: Props) => [Partial<CascadeSelectProps<any>>, Omit<Props, keyof CascadeSelectProps<any>>];

export { props, splitProps };
