import { FloatingPanelProps, ResizeTriggerAxis, ResizeTriggerProps } from './floating-panel.types.mjs';
import '@zag-js/core';
import '@zag-js/rect-utils';
import '@zag-js/types';

declare const props: (keyof FloatingPanelProps)[];
declare const splitProps: <Props extends Partial<FloatingPanelProps>>(props: Props) => [Partial<FloatingPanelProps>, Omit<Props, keyof FloatingPanelProps>];
declare const resizeTriggerProps: "axis"[];
declare const splitResizeTriggerProps: <Props extends Partial<ResizeTriggerProps>>(props: Props) => [Partial<ResizeTriggerProps>, Omit<Props, "axis">];
declare const resizeTriggerAxes: ResizeTriggerAxis[];

export { props, resizeTriggerAxes, resizeTriggerProps, splitProps, splitResizeTriggerProps };
