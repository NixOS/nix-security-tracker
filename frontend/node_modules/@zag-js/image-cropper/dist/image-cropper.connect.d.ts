import { PropTypes, NormalizeProps } from '@zag-js/types';
import { ImageCropperService, ImageCropperApi } from './image-cropper.types.js';
import '@zag-js/core';

declare function connect<T extends PropTypes>(service: ImageCropperService, normalize: NormalizeProps<T>): ImageCropperApi<T>;

export { connect };
