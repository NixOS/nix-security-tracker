import { IndexPath, FlatTreeNode } from './types.js';

declare function access<T>(node: T, indexPath: IndexPath, options: BaseOptions<T>): T;
declare function accessPath<T>(node: T, indexPath: IndexPath, options: BaseOptions<T>): T[];
declare function ancestorIndexPaths(indexPaths: IndexPath[]): IndexPath[];
declare function compareIndexPaths(a: IndexPath, b: IndexPath): number;
declare function sortIndexPaths(indexPaths: IndexPath[]): IndexPath[];
declare function find<T>(node: T, options: FindOptions<T>): T | undefined;
declare function find<T, S extends T>(node: T, options: FindOptionsTyped<T, S>): S | undefined;
declare function findAll<T>(node: T, options: FindOptions<T>): T[];
declare function findAll<T, S extends T>(node: T, options: FindOptionsTyped<T, S>): S[];
declare function findIndexPath<T>(node: T, options: FindOptions<T>): IndexPath | undefined;
declare function findAllIndexPaths<T>(node: T, options: FindOptions<T>): IndexPath[];
declare function reduce<T, R>(node: T, options: ReduceOptions<T, R>): R;
declare function flat<T>(node: T, options: BaseOptions<T>): T[];
declare function flatMap<T, R>(node: T, options: FlatMapOptions<T, R>): R[];
declare function filter<T>(node: T, options: FilterOptions<T>): T;
declare function flatten<T>(rootNode: T, options: BaseOptions<T>): Array<FlatTreeNode<T>>;
declare function map<T, U>(node: T, options: MapOptions<T, U>): U;
declare function insert<T>(node: T, options: InsertOptions<T>): T;
declare function replace<T>(node: T, options: ReplaceOptions<T>): T;
declare function remove<T>(node: T, options: RemoveOptions<T>): T;
declare function move<T>(node: T, options: MoveOptions<T>): T;
declare function visit<T>(node: T, options: TreeVisitOptions<T>): void;
type NodeOperation<T> = {
    type: "insert";
    index: number;
    nodes: T[];
} | {
    type: "remove";
    indexes: number[];
} | {
    type: "replace";
} | {
    type: "removeThenInsert";
    removeIndexes: number[];
    insertIndex: number;
    insertNodes: T[];
};
interface BaseOptions<T> {
    getChildren: (node: T, indexPath: IndexPath) => T[];
    reuseIndexPath?: boolean | undefined;
}
interface FindOptions<T> extends BaseOptions<T> {
    predicate: (node: T, indexPath: IndexPath) => boolean;
}
interface RemoveOptions<T> extends MutationBaseOptions<T> {
    indexPaths: IndexPath[];
}
interface MapOptions<T, U> extends BaseOptions<T> {
    transform: (node: T, transformedChildren: U[], indexPath: IndexPath) => U;
}
interface FindOptionsTyped<T, S extends T> extends BaseOptions<T> {
    predicate: (node: T, indexPath: IndexPath) => node is S;
}
interface ReduceOptions<T, R> extends BaseOptions<T> {
    initialResult: R;
    nextResult: (result: R, node: T, indexPath: IndexPath) => R;
}
interface FlatMapOptions<T, R> extends BaseOptions<T> {
    transform: (node: T, indexPath: IndexPath) => R[];
}
interface FilterOptions<T> extends MutationBaseOptions<T> {
    predicate: (node: T, indexPath: IndexPath) => boolean;
}
interface MutationBaseOptions<T> extends BaseOptions<T> {
    create: (node: T, children: T[], indexPath: IndexPath) => T;
}
interface InsertOptions<T> extends MutationBaseOptions<T> {
    nodes: T[];
    at: IndexPath;
}
interface MoveOptions<T> extends MutationBaseOptions<T> {
    indexPaths: IndexPath[];
    to: IndexPath;
}
interface ReplaceOptions<T> extends MutationBaseOptions<T> {
    at: IndexPath;
    node: T;
}
type TreeVisitEnterReturnValue = void | "skip" | "stop";
type TreeVisitLeaveReturnValue = void | "stop";
interface TreeVisitOptions<T> extends BaseOptions<T> {
    onEnter?(node: T, indexPath: IndexPath): TreeVisitEnterReturnValue;
    onLeave?(node: T, indexPath: IndexPath): TreeVisitLeaveReturnValue;
}

export { type BaseOptions, type FilterOptions, type FindOptions, type FindOptionsTyped, type FlatMapOptions, type InsertOptions, type MapOptions, type MoveOptions, type MutationBaseOptions, type NodeOperation, type ReduceOptions, type RemoveOptions, type ReplaceOptions, type TreeVisitEnterReturnValue, type TreeVisitLeaveReturnValue, type TreeVisitOptions, access, accessPath, ancestorIndexPaths, compareIndexPaths, filter, find, findAll, findAllIndexPaths, findIndexPath, flat, flatMap, flatten, insert, map, move, reduce, remove, replace, sortIndexPaths, visit };
