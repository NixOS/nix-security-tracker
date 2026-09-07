import { FilePathTreeNode, TreeCollection, TreeCollectionOptions, TreeNode } from '@zag-js/collection';
export type { TreeCollection, TreeNode, TreeCollectionOptions, FilePathTreeNode, FlatTreeNode, } from '@zag-js/collection';
export declare const createTreeCollection: <T extends TreeNode>(options: TreeCollectionOptions<T>) => TreeCollection<T>;
export declare const createFileTreeCollection: (paths: string[]) => TreeCollection<FilePathTreeNode>;
