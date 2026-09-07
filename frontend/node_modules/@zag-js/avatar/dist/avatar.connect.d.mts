import { PropTypes, NormalizeProps } from '@zag-js/types';
import { Service } from '@zag-js/core';
import { AvatarSchema, AvatarApi } from './avatar.types.mjs';

declare function connect<T extends PropTypes>(service: Service<AvatarSchema>, normalize: NormalizeProps<T>): AvatarApi<T>;

export { connect };
