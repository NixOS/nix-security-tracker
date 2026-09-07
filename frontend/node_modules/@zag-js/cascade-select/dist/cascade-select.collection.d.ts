import { TreeCollectionOptions, TreeCollection } from '@zag-js/collection';
export { TreeNode } from '@zag-js/collection';

declare const collection: {
    <T extends unknown = any>(options: TreeCollectionOptions<T>): TreeCollection<T>;
    empty<T extends unknown = any>(): TreeCollection<T>;
};

export { collection };
