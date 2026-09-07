import { TreeCollection, TreeNode } from '@zag-js/collection';
import { CheckedValueMap } from '../tree-view.types.js';
import '@zag-js/core';
import '@zag-js/dom-query';
import '@zag-js/types';

declare function getCheckedState(collection: TreeCollection, node: TreeNode, checkedValue: string[]): boolean | "indeterminate";
declare function toggleBranchChecked(collection: TreeCollection, value: string, checkedValue: string[]): string[];
declare function getCheckedValueMap(collection: TreeCollection, checkedValue: string[]): CheckedValueMap;

export { getCheckedState, getCheckedValueMap, toggleBranchChecked };
