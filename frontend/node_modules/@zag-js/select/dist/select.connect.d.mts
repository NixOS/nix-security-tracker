import { Service } from '@zag-js/core';
import { PropTypes, NormalizeProps } from '@zag-js/types';
import { SelectSchema, SelectApi } from './select.types.mjs';
import { CollectionItem } from '@zag-js/collection';
import '@zag-js/dismissable';
import '@zag-js/dom-query';
import '@zag-js/popper';

declare function connect<T extends PropTypes, V extends CollectionItem = CollectionItem>(service: Service<SelectSchema<V>>, normalize: NormalizeProps<T>): SelectApi<T, V>;

export { connect };
