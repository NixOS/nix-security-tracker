import { JSX } from '@zag-js/types';
import { HandlePosition } from './image-cropper.types.js';
import '@zag-js/core';

declare function getHandlePositionStyles(handlePosition: HandlePosition): JSX.CSSProperties;

export { getHandlePositionStyles };
