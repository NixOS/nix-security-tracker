interface CollectionSearchState {
    keysSoFar: string;
    timer: number;
}
interface CollectionSearchOptions {
    state: CollectionSearchState;
    currentValue: string | null;
    timeout?: number | undefined;
}
type CollectionItem = any;
interface CollectionMethods<T extends CollectionItem = CollectionItem> {
    /**
     * The value of the item
     */
    itemToValue: (item: T) => string;
    /**
     * The label of the item
     */
    itemToString: (item: T) => string;
    /**
     * Whether the item is disabled
     */
    isItemDisabled: (item: T) => boolean;
}
interface CollectionOptions<T extends CollectionItem = CollectionItem> extends Partial<CollectionMethods<T>> {
    /**
     * The options of the select
     */
    items: Iterable<T> | Readonly<Iterable<T>>;
    /**
     * Function to group items
     */
    groupBy?: ((item: T, index: number) => string) | undefined;
    /**
     * Function to sort items
     */
    groupSort?: ((a: string, b: string) => number) | string[] | "asc" | "desc" | undefined;
}
type IndexPath = number[];
type ValuePath = string[];
interface TreeCollectionMethods<T> {
    isNodeDisabled: (node: T) => boolean;
    nodeToValue: (node: T) => string;
    nodeToString: (node: T) => string;
    nodeToChildren: (node: T) => any[];
    nodeToChildrenCount: (node: T) => number | undefined;
}
interface TreeCollectionOptions<T> extends Partial<TreeCollectionMethods<T>> {
    rootNode: T;
}
type TreeNode = any;
type FilePathTreeNode<T = TreeNode> = T & {
    children?: FilePathTreeNode<T>[] | undefined;
};
interface FlatTreeNodeMeta {
    _children: number[] | undefined;
    _parent: number | undefined;
    _index: number;
}
type FlatTreeNode<T = TreeNode> = T & FlatTreeNodeMeta;
interface TreeSkipFnArgs<T> {
    value: string;
    node: T;
    indexPath: number[];
}
type TreeSkipFn<T> = (args: TreeSkipFnArgs<T>) => boolean | void;
interface TreeSkipOptions<T> {
    skip?: TreeSkipFn<T> | undefined;
}
interface DescendantOptions {
    withBranch?: boolean;
}

export type { CollectionItem, CollectionMethods, CollectionOptions, CollectionSearchOptions, CollectionSearchState, DescendantOptions, FilePathTreeNode, FlatTreeNode, FlatTreeNodeMeta, IndexPath, TreeCollectionMethods, TreeCollectionOptions, TreeNode, TreeSkipFn, TreeSkipFnArgs, TreeSkipOptions, ValuePath };
