import { TreeSkipFn } from '@zag-js/collection';
import { Params } from '@zag-js/core';
import { TreeViewSchema } from '../tree-view.types.js';
import '@zag-js/dom-query';
import '@zag-js/types';

declare function skipFn(params: Pick<Params<TreeViewSchema>, "prop" | "context">): TreeSkipFn<any>;

export { skipFn };
