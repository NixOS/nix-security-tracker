import { TreeVisitOptions } from './tree-visit.js';
import { TreeNode, TreeCollectionOptions, TreeSkipOptions, IndexPath, DescendantOptions, FlatTreeNode, FilePathTreeNode, TreeCollectionMethods } from './types.js';

declare class TreeCollection<T = TreeNode> {
    private options;
    rootNode: T;
    constructor(options: TreeCollectionOptions<T>);
    isEqual: (other: TreeCollection<T>) => boolean;
    getNodeChildren: (node: T) => T[];
    private resolveIndexPath;
    private resolveNode;
    getNodeChildrenCount: (node: T) => number | undefined;
    getNodeValue: (node: T) => string;
    getNodeDisabled: (node: T) => boolean;
    stringify: (value: string) => string | null;
    stringifyNode: (node: T) => string;
    getFirstNode: (rootNode?: T, opts?: TreeSkipOptions<T>) => T | undefined;
    getLastNode: (rootNode?: T, opts?: TreeSkipOptions<T>) => T | undefined;
    at: (indexPath: IndexPath) => T | undefined;
    findNode: (value: string, rootNode?: T) => T | undefined;
    findNodes: (values: string[], rootNode?: T) => T[];
    sort: (values: string[]) => string[];
    /**
     * Get the index path for a value or value path.
     * @param value - A single value string to find in the tree
     * @returns The index path to the node, or undefined if not found
     */
    getIndexPath(value: string): IndexPath | undefined;
    /**
     * Get the index path for a value path (array of values representing ancestors).
     * @param valuePath - An array of values representing the path from root to target
     * @returns The index path to the node
     */
    getIndexPath(valuePath: string[]): IndexPath;
    getValue: (indexPath: IndexPath) => string | undefined;
    getValuePath: (indexPath: IndexPath | undefined) => string[];
    getDepth: (value: string) => number;
    isSameNode: (node: T, other: T) => boolean;
    isRootNode: (node: T) => boolean;
    contains: (parentIndexPath: IndexPath, valueIndexPath: IndexPath) => boolean;
    getNextNode: (value: string, opts?: TreeSkipOptions<T>) => T | undefined;
    getPreviousNode: (value: string, opts?: TreeSkipOptions<T>) => T | undefined;
    getParentNodes: (valueOrIndexPath: string | IndexPath) => T[];
    getDescendantNodes: (valueOrIndexPath: string | IndexPath, options?: DescendantOptions) => T[];
    getDescendantValues: (valueOrIndexPath: string | IndexPath, options?: DescendantOptions) => string[];
    private getParentIndexPath;
    getParentNode: (valueOrIndexPath: string | IndexPath) => T | undefined;
    visit: (opts: Omit<TreeVisitOptions<T>, "getChildren"> & TreeSkipOptions<T>) => void;
    getPreviousSibling: (indexPath: IndexPath) => T | undefined;
    getNextSibling: (indexPath: IndexPath) => T | undefined;
    getSiblingNodes: (indexPath: IndexPath) => T[];
    getValues: (rootNode?: T) => string[];
    private isValidDepth;
    isBranchNode: (node: T) => boolean;
    getBranchValues: (rootNode?: T, opts?: TreeSkipOptions<T> & {
        depth?: number | ((nodeDepth: number) => boolean) | undefined;
    }) => string[];
    flatten: (rootNode?: T) => Array<FlatTreeNode<T>>;
    private _create;
    private _insert;
    copy: (rootNode: T) => TreeCollection<T>;
    private _replace;
    private _move;
    private _remove;
    replace: (indexPath: IndexPath, node: T) => TreeCollection<T>;
    remove: (indexPaths: IndexPath[]) => TreeCollection<T>;
    insertBefore: (indexPath: IndexPath, nodes: T[]) => TreeCollection<T> | undefined;
    insertAfter: (indexPath: IndexPath, nodes: T[]) => TreeCollection<T> | undefined;
    move: (fromIndexPaths: IndexPath[], toIndexPath: IndexPath) => TreeCollection<T>;
    filter: (predicate: (node: T, indexPath: IndexPath) => boolean) => TreeCollection<T>;
    toJSON: () => string[];
}
declare function flattenedToTree<T>(nodes: Array<FlatTreeNode<T>>, options?: TreeCollectionMethods<T>): TreeCollection<T>;
declare function filePathToTree(paths: string[]): TreeCollection<FilePathTreeNode>;

export { TreeCollection, filePathToTree, flattenedToTree };
