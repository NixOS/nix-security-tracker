import { JSX } from '@zag-js/types';
import { HandlePosition } from './image-cropper.types.mjs';
import '@zag-js/core';

declare function getHandlePositionStyles(handlePosition: HandlePosition): JSX.CSSProperties;

export { getHandlePositionStyles };
