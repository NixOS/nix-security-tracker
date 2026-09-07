import { JSX } from '@zag-js/types';
import { ResizeTriggerAxis } from './floating-panel.types.js';
import '@zag-js/core';
import '@zag-js/rect-utils';

declare function getResizeAxisStyle(axis: ResizeTriggerAxis): JSX.CSSProperties;

export { getResizeAxisStyle };
