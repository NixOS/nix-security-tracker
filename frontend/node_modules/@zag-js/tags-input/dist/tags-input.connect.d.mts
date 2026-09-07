import { Service } from '@zag-js/core';
import { PropTypes, NormalizeProps } from '@zag-js/types';
import { TagsInputSchema, TagsInputApi } from './tags-input.types.mjs';
import '@zag-js/interact-outside';
import '@zag-js/live-region';

declare function connect<T extends PropTypes>(service: Service<TagsInputSchema>, normalize: NormalizeProps<T>): TagsInputApi<T>;

export { connect };
