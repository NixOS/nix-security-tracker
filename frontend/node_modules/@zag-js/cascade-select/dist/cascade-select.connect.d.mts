import { PropTypes, NormalizeProps } from '@zag-js/types';
import { Service } from '@zag-js/core';
import { CascadeSelectSchema, CascadeSelectApi } from './cascade-select.types.mjs';
import { TreeNode } from '@zag-js/collection';
import '@zag-js/popper';
import '@zag-js/rect-utils';
import '@zag-js/dismissable';

declare function connect<T extends PropTypes, V = TreeNode>(service: Service<CascadeSelectSchema>, normalize: NormalizeProps<T>): CascadeSelectApi<T, V>;

export { connect };
