import { Params } from '@zag-js/core';
import { TreeViewSchema } from '../tree-view.types.mjs';
import '@zag-js/collection';
import '@zag-js/dom-query';
import '@zag-js/types';

declare function expandBranches(params: Params<TreeViewSchema>, values: string[]): void;

export { expandBranches };
