import { NodeProps, TreeViewProps } from './tree-view.types.js';
import '@zag-js/collection';
import '@zag-js/core';
import '@zag-js/dom-query';
import '@zag-js/types';

declare const props: (keyof TreeViewProps<any>)[];
declare const splitProps: <Props extends Partial<TreeViewProps<any>>>(props: Props) => [Partial<TreeViewProps<any>>, Omit<Props, keyof TreeViewProps<any>>];
declare const itemProps: (keyof NodeProps)[];
declare const splitItemProps: <Props extends NodeProps>(props: Props) => [NodeProps, Omit<Props, keyof NodeProps>];

export { itemProps, props, splitItemProps, splitProps };
