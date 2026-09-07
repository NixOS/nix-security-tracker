declare function toArray<T>(v: T | T[] | undefined | null): T[];
declare const fromLength: (length: number) => number[];
declare const first: <T>(v: T[]) => T | undefined;
declare const last: <T>(v: T[]) => T | undefined;
declare const isEmpty: <T>(v: T[]) => boolean;
declare const has: <T>(v: T[], t: T) => boolean;
declare const add: <T>(v: T[], ...items: T[]) => T[];
declare const remove: <T>(v: T[], ...items: T[]) => T[];
declare const removeAt: <T>(v: T[], i: number) => T[];
declare const insertAt: <T>(v: T[], i: number, ...items: T[]) => T[];
declare const uniq: <T>(v: T[]) => T[];
declare const diff: <T>(a: T[], b: T[]) => T[];
declare const addOrRemove: <T>(v: T[], item: T) => T[];
declare function clear<T>(v: T[]): T[];
type IndexOptions = {
    step?: number | undefined;
    loop?: boolean | undefined;
};
declare function nextIndex<T>(v: T[], idx: number, opts?: IndexOptions): number;
declare function next<T>(v: T[], idx: number, opts?: IndexOptions): T | undefined;
declare function prevIndex<T>(v: T[], idx: number, opts?: IndexOptions): number;
declare function prev<T>(v: T[], index: number, opts?: IndexOptions): T | undefined;
declare function chunk<T>(v: T[], size: number): T[][];
declare function flatArray<T>(arr: T[]): T[];
declare function partition<T>(arr: T[], fn: (value: T) => boolean): [T[], T[]];

export { type IndexOptions, add, addOrRemove, chunk, clear, diff, first, flatArray, fromLength, has, insertAt, isEmpty, last, next, nextIndex, partition, prev, prevIndex, remove, removeAt, toArray, uniq };
