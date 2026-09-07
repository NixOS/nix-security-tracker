import { CollectionItem } from '@zag-js/collection';
import { Service } from '@zag-js/core';
import { PropTypes, NormalizeProps } from '@zag-js/types';
import { ListboxSchema, ListboxApi } from './listbox.types.js';
import '@zag-js/dom-query';

declare function connect<T extends PropTypes, V extends CollectionItem = CollectionItem>(service: Service<ListboxSchema<V>>, normalize: NormalizeProps<T>): ListboxApi<T, V>;

export { connect };
