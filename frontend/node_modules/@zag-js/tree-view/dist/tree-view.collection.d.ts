import { TreeCollectionOptions, TreeCollection, FilePathTreeNode } from '@zag-js/collection';

declare const collection: {
    <T>(options: TreeCollectionOptions<T>): TreeCollection<T>;
    empty(): TreeCollection;
};
declare function filePathCollection(paths: string[]): TreeCollection<FilePathTreeNode>;

export { collection, filePathCollection };
