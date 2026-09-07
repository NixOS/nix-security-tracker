import { HandlePosition, ImageCropperProps } from './image-cropper.types.mjs';
import '@zag-js/core';
import '@zag-js/types';

declare const props: (keyof ImageCropperProps)[];
declare const splitProps: <Props extends Partial<ImageCropperProps>>(props: Props) => [Partial<ImageCropperProps>, Omit<Props, keyof ImageCropperProps>];
declare const handles: HandlePosition[];

export { handles, props, splitProps };
