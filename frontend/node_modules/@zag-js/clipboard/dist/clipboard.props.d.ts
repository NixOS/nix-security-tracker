import { ClipboardProps, IndicatorProps } from './clipboard.types.js';
import '@zag-js/core';
import '@zag-js/types';

declare const props: (keyof ClipboardProps)[];
declare const contextProps: <Props extends ClipboardProps>(props: Props) => [ClipboardProps, Omit<Props, keyof ClipboardProps>];
declare const indicatorProps: "copied"[];
declare const splitIndicatorProps: <Props extends IndicatorProps>(props: Props) => [IndicatorProps, Omit<Props, "copied">];

export { contextProps, indicatorProps, props, splitIndicatorProps };
