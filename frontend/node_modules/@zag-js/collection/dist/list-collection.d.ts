import { CollectionItem, CollectionOptions, CollectionSearchOptions } from './types.js';

declare class ListCollection<T extends CollectionItem = CollectionItem> {
    private options;
    /**
     * The items in the collection
     */
    items: T[];
    private indexMap;
    constructor(options: CollectionOptions<T>);
    /**
     * Copy the collection
     */
    copy: (items?: T[]) => ListCollection<T>;
    /**
     * Check if the collection is equal to another collection
     */
    isEqual: (other: ListCollection<T>) => boolean;
    /**
     * Function to update the collection items
     */
    setItems: (items: T[]) => ListCollection<T>;
    /**
     * Returns all the values in the collection
     */
    getValues: (items?: T[]) => string[];
    /**
     * Get the item based on its value
     */
    find: (value: string | null | undefined) => T | null;
    /**
     * Get the items based on its values
     */
    findMany: (values: string[]) => T[];
    /**
     * Get the item based on its index
     */
    at: (index: number) => T | null;
    private sortFn;
    /**
     * Sort the values based on their index
     */
    sort: (values: string[]) => string[];
    /**
     * Convert an item to a value
     */
    getItemValue: (item: T | null | undefined) => string | null;
    /**
     * Whether an item is disabled
     */
    getItemDisabled: (item: T | null) => boolean;
    /**
     * Convert an item to a string
     */
    stringifyItem: (item: T | null) => string | null;
    /**
     * Convert a value to a string
     */
    stringify: (value: string | null) => string | null;
    /**
     * Convert an array of items to a string
     */
    stringifyItems: (items: T[], separator?: string) => string;
    /**
     * Convert an array of items to a string
     */
    stringifyMany: (value: string[], separator?: string) => string;
    /**
     * Whether the collection has a value
     */
    has: (value: string | null) => boolean;
    /**
     * Whether the collection has an item
     */
    hasItem: (item: T | null) => boolean;
    /**
     * Returns the number of items in the collection
     */
    get size(): number;
    /**
     * Group items by the groupBy function provided in options
     * Returns an array of [groupKey, items] tuples
     */
    group: () => [string, T[]][];
    /**
     * Returns the first value in the collection
     */
    get firstValue(): string | null;
    /**
     * Returns the last value in the collection
     */
    get lastValue(): string | null;
    /**
     * Returns the next value in the collection
     */
    getNextValue: (value: string, step?: number, clamp?: boolean) => string | null;
    /**
     * Returns the previous value in the collection
     */
    getPreviousValue: (value: string, step?: number, clamp?: boolean) => string | null;
    /**
     * Get the index of an item based on its key
     */
    indexOf: (value: string | null) => number;
    private getByText;
    /**
     * Search for a value based on a query
     */
    search: (queryString: string, options: CollectionSearchOptions) => string | null;
    [Symbol.iterator](): Generator<T, void, unknown>;
    /**
     * Update an item in the collection
     */
    update: (value: string, item: T) => ListCollection<T>;
    /**
     * Update an item in the collection if it exists, otherwise append it
     */
    upsert: (value: string, item: T, mode?: "append" | "prepend") => ListCollection<T>;
    /**
     * Insert items at a specific index
     */
    insert: (index: number, ...items: T[]) => ListCollection<T>;
    /**
     * Insert items before a specific value
     */
    insertBefore: (value: string, ...items: T[]) => ListCollection<T>;
    /**
     * Insert items after a specific value
     */
    insertAfter: (value: string, ...items: T[]) => ListCollection<T>;
    /**
     * Prepend items to the collection
     */
    prepend: (...items: T[]) => ListCollection<T>;
    /**
     * Append items to the collection
     */
    append: (...items: T[]) => ListCollection<T>;
    /**
     * Filter the collection
     */
    filter: (fn: (itemString: string, index: number, item: T) => boolean) => ListCollection<T>;
    /**
     * Remove items from the collection
     */
    remove: (...itemsOrValues: Array<T | string>) => ListCollection<T>;
    /**
     * Move an item to a specific index
     */
    move: (value: string, toIndex: number) => ListCollection<T>;
    /**
     * Move items before a specific value
     */
    moveBefore: (value: string, ...values: string[]) => ListCollection<T>;
    /**
     * Move items after a specific value
     */
    moveAfter: (value: string, ...values: string[]) => ListCollection<T>;
    /**
     * Reorder items
     */
    reorder: (fromIndex: number, toIndex: number) => ListCollection<T>;
    /**
     * Compare two values
     */
    compareValue: (a: string, b: string) => 1 | -1 | 0;
    /**
     * Get the range of values between two values
     */
    private range;
    /**
     * Get the range of values between two values
     */
    getValueRange: (from: string | null, to: string | null) => string[];
    /**
     * Convert the collection to a string
     */
    toString: () => string;
    /**
     * Convert the collection to a JSON object
     */
    toJSON: () => {
        size: number;
        first: string | null;
        last: string | null;
    };
}
declare function isListCollection(v: unknown): v is ListCollection<any>;

export { ListCollection, isListCollection };
